#!/usr/bin/env python3
"""Link each card to a player headshot using nflverse roster IDs.

Headshots are hotlinked, never downloaded into the repo. Each player gets one
photo across all of their cards: the NFL headshot from their most recent
roster season when it is a real photo, otherwise ESPN's headshot by ESPN ID.
NFL serves a generic helmet for players it has no photo of, so every NFL link
is fetched once (small size) and compared against that placeholder. Players
with no real photo keep an empty imageUrl and show the jersey-number art.
"""

from __future__ import annotations

import hashlib
import json
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from enrich_jersey_numbers import (
    CARD_OVERRIDES,
    DATA_PATH,
    fetch_roster,
    index_name_keys,
    name_variants,
    normalize_name,
    resolve_team_codes,
    slug_name,
)

ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "scripts/headshot-enrichment-report.json"
ESPN_HEADSHOT = "https://a.espncdn.com/i/headshots/nfl/players/full/{espn_id}.png"
# MD5 of NFL's generic "no photo" helmet, fetched at f_png,w_120.
NFL_PLACEHOLDER_MD5 = "80017341ab10bb7d6f9685131d8740b6"


def fetch(url: str) -> bytes | None:
    request = urllib.request.Request(url, headers={"User-Agent": "draft-cards-enrichment"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.read()
    except (urllib.error.URLError, TimeoutError):
        return None


def is_real_nfl_photo(url: str) -> bool:
    body = fetch(url.replace("f_auto,q_auto", "f_png,w_120"))
    return body is not None and hashlib.md5(body).hexdigest() != NFL_PLACEHOLDER_MD5


def espn_photo_exists(url: str) -> bool:
    return fetch(url) is not None


def card_name_keys(card: dict) -> set[str]:
    if card["id"] in CARD_OVERRIDES:
        return {normalize_name(CARD_OVERRIDES[card["id"]][2])}
    return {*name_variants(card["name"]), slug_name(card["playerId"])}


def find_roster_row(rows: list[dict[str, str]], card: dict) -> dict[str, str] | None:
    teams = {row.get("team", "").strip() for row in rows}
    team_codes = set(resolve_team_codes(card["team"], card["season"], teams))
    keys = card_name_keys(card)
    for row in rows:
        if row.get("team", "").strip() not in team_codes:
            continue
        row_keys = index_name_keys(
            row.get("full_name", ""), row.get("first_name", ""), row.get("last_name", "")
        )
        if keys & row_keys:
            return row
    return None


def main() -> None:
    cards: list[dict] = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    rosters = {season: fetch_roster(season) for season in sorted({c["season"] for c in cards})}

    # playerId -> gsis id from the card's own season, so later seasons can be
    # searched by a stable ID instead of team + name.
    ids: dict[str, dict[str, str]] = {}
    unmatched: list[str] = []
    for card in cards:
        row = find_roster_row(rosters[card["season"]], card)
        if row is None:
            unmatched.append(card["id"])
            continue
        known = ids.setdefault(card["playerId"], {})
        for field in ("gsis_id", "espn_id"):
            if row.get(field) and not known.get(field):
                known[field] = row[field].strip()

    # Latest non-empty NFL headshot for each player across every cached season.
    nfl_headshots: dict[str, str] = {}
    gsis_to_player = {v["gsis_id"]: pid for pid, v in ids.items() if v.get("gsis_id")}
    for season in sorted(rosters):
        for row in rosters[season]:
            pid = gsis_to_player.get(row.get("gsis_id", "").strip())
            if pid and row.get("headshot_url", "").strip():
                nfl_headshots[pid] = row["headshot_url"].strip()
            if pid and row.get("espn_id", "").strip() and not ids[pid].get("espn_id"):
                ids[pid]["espn_id"] = row["espn_id"].strip()

    def choose(pid: str) -> tuple[str, str]:
        nfl = nfl_headshots.get(pid)
        if nfl and is_real_nfl_photo(nfl):
            return nfl, "nfl"
        espn_id = ids.get(pid, {}).get("espn_id", "").split(".")[0]
        if espn_id:
            espn = ESPN_HEADSHOT.format(espn_id=espn_id)
            if espn_photo_exists(espn):
                return espn, "espn"
        return "", "none"

    player_ids = sorted({c["playerId"] for c in cards})
    with ThreadPoolExecutor(max_workers=16) as pool:
        chosen = dict(zip(player_ids, pool.map(choose, player_ids)))

    sources = {"nfl": 0, "espn": 0, "none": 0}
    for card in cards:
        card["imageUrl"], source = chosen[card["playerId"]]
        sources[source] += 1

    DATA_PATH.write_text(json.dumps(cards, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_PATH.write_text(
        json.dumps(
            {
                "cards": len(cards),
                "sources": sources,
                "unmatchedCards": unmatched,
                "noImage": sorted({c["playerId"] for c in cards if not c["imageUrl"]}),
                "espn": sorted({c["playerId"] for c in cards if "espncdn" in c["imageUrl"]}),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"cards={len(cards)} sources={sources} unmatched={len(unmatched)}")


if __name__ == "__main__":
    main()
