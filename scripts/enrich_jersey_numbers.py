#!/usr/bin/env python3
"""Populate season-specific jersey numbers from nflverse roster releases."""

from __future__ import annotations

import csv
import io
import json
import re
import unicodedata
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "src/data/draft-cards-enriched-350.json"
CACHE_DIR = ROOT / "scripts/.roster-cache"
ROSTER_URL = "https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_{season}.csv"

POSITIONS = {"QB", "RB", "WR", "TE", "FB"}

# Card team code -> nflverse historical aliases (ordered by preference)
TEAM_ALIASES: dict[str, list[str]] = {
    "ARI": ["ARI", "ARZ"],
    "BAL": ["BAL", "BLT"],
    "CLE": ["CLE", "CLV"],
    "HOU": ["HOU", "HST"],
    "STL": ["STL", "SL"],
    "LAR": ["LAR", "LA"],
    "LAC": ["LAC", "SD"],
    "LV": ["LV", "OAK"],
    "OAK": ["OAK", "LV"],
}

# Card-specific lookup overrides for legal name / franchise edge cases
CARD_OVERRIDES: dict[str, tuple[str, str, str]] = {
    "chad-johnson-2005": ("CIN", "WR", "chad ochocinco"),
}


def normalize_name(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower()
    value = re.sub(r"\.", " ", value)
    value = re.sub(r"[^a-z0-9 ]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    for suffix in (" jr", " sr", " ii", " iii", " iv"):
        if value.endswith(suffix):
            value = value[: -len(suffix)].strip()
    return value


def name_variants(name: str) -> set[str]:
    base = normalize_name(name)
    variants = {base}

    parts = base.split()
    if len(parts) >= 2:
        head = parts[0]
        if len(head) == 1 and len(parts) >= 3 and len(parts[1]) == 1:
            collapsed = "".join(parts[:2]) + " " + " ".join(parts[2:])
            variants.add(collapsed.replace("  ", " ").strip())

        if len(head) == 2 and head.isalpha():
            variants.add(f"{head[0]} {head[1]} {' '.join(parts[1:])}".strip())

        first = parts[0]
        rest = " ".join(parts[1:])
        if first == "matt":
            variants.add(f"matthew {rest}")
        if first == "matthew":
            variants.add(f"matt {rest}")

    return {normalize_name(v) for v in variants if v}


def index_name_keys(full_name: str, first_name: str, last_name: str) -> set[str]:
    keys = {
        normalize_name(full_name),
        normalize_name(f"{first_name} {last_name}"),
        normalize_name(f"{first_name} {last_name}".strip()),
    }
    expanded: set[str] = set()
    for key in keys:
        if key:
            expanded.update(name_variants(key))
    return expanded


def slug_name(player_id: str) -> str:
    return normalize_name(player_id.replace("-", " "))


def resolve_team_codes(card_team: str, season: int, roster_teams: set[str]) -> list[str]:
    candidates = [card_team, *TEAM_ALIASES.get(card_team, [])]

    # Rams relocation
    if card_team == "LAR" and season >= 2016:
        candidates = ["LA", "LAR", *candidates]

    # De-duplicate while preserving order and keeping codes present in roster when possible
    ordered: list[str] = []
    for code in candidates:
        if code not in ordered:
            ordered.append(code)

    present = [code for code in ordered if code in roster_teams]
    return present if present else ordered


def fetch_roster(season: int) -> list[dict[str, str]]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CACHE_DIR / f"roster_{season}.csv"
    if not cache_path.exists():
        url = ROSTER_URL.format(season=season)
        with urllib.request.urlopen(url, timeout=120) as response:
            cache_path.write_bytes(response.read())
    text = cache_path.read_text(encoding="utf-8")
    return list(csv.DictReader(io.StringIO(text)))


def build_roster_index(rows: list[dict[str, str]]) -> tuple[dict[tuple[str, str, str], Counter[int]], set[str]]:
    index: dict[tuple[str, str, str], Counter[int]] = defaultdict(Counter)
    teams: set[str] = set()
    for row in rows:
        team = row.get("team", "").strip()
        teams.add(team)
        position = row.get("position", "").strip()
        if position not in POSITIONS:
            continue
        lookup_position = "TE" if position == "FB" else position
        jersey_raw = row.get("jersey_number", "").strip()
        if not jersey_raw:
            continue
        try:
            jersey = int(float(jersey_raw))
        except ValueError:
            continue
        if jersey < 0 or jersey > 99:
            continue

        for name_key in index_name_keys(
            row.get("full_name", ""),
            row.get("first_name", ""),
            row.get("last_name", ""),
        ):
            index[(team, lookup_position, name_key)][jersey] += 1
    return index, teams


def choose_jersey(counter: Counter[int]) -> int | None:
    if not counter:
        return None
    return counter.most_common(1)[0][0]


def lookup_jersey(
    index: dict[tuple[str, str, str], Counter[int]],
    roster_teams: set[str],
    card: dict,
) -> int | None:
    card_id = card["id"]
    position = card["position"]
    season = card["season"]

    if card_id in CARD_OVERRIDES:
        team, pos, name_key = CARD_OVERRIDES[card_id]
        return choose_jersey(index.get((team, pos, normalize_name(name_key)), Counter()))

    team_codes = resolve_team_codes(card["team"], season, roster_teams)
    name_keys: set[str] = set()
    for variant in name_variants(card["name"]):
        name_keys.add(variant)
    name_keys.add(slug_name(card["playerId"]))

    merged: Counter[int] = Counter()
    for team in team_codes:
        for name_key in name_keys:
            merged.update(index.get((team, position, name_key), Counter()))

    jersey = choose_jersey(merged)
    if jersey is not None:
        return jersey

    # Position-agnostic fallback within team/name
    merged_any_pos: Counter[int] = Counter()
    for team in team_codes:
        for name_key in name_keys:
            for (t, _pos, n), counts in index.items():
                if t == team and n == name_key:
                    merged_any_pos.update(counts)

    return choose_jersey(merged_any_pos)


def main() -> None:
    cards: list[dict] = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    original_cards = json.loads(json.dumps(cards))

    existing = {
        c["id"]: c.get("jerseyNumber")
        for c in cards
        if c.get("jerseyNumber") is not None
    }

    seasons = sorted({c["season"] for c in cards})
    season_data: dict[int, tuple[dict, set[str]]] = {}
    for season in seasons:
        rows = fetch_roster(season)
        season_data[season] = build_roster_index(rows)

    added = 0
    retained = 0
    corrected = 0
    corrections: list[dict] = []
    unresolved: list[dict] = []

    for card in cards:
        prior = card.get("jerseyNumber")
        index, roster_teams = season_data[card["season"]]
        jersey = lookup_jersey(index, roster_teams, card)

        if prior is not None:
            if jersey is None:
                retained += 1
                continue
            if jersey == prior:
                retained += 1
            else:
                corrected += 1
                corrections.append(
                    {"id": card["id"], "from": prior, "to": jersey, "name": card["name"]},
                )
            card["jerseyNumber"] = jersey
            continue

        if jersey is None:
            unresolved.append(
                {
                    "id": card["id"],
                    "name": card["name"],
                    "team": card["team"],
                    "season": card["season"],
                    "position": card["position"],
                },
            )
            continue

        card["jerseyNumber"] = jersey
        added += 1

    for before, after in zip(original_cards, cards):
        for key in before:
            if key == "jerseyNumber":
                continue
            if before[key] != after[key]:
                raise RuntimeError(f"Unexpected field change on {before['id']}: {key}")

    report = {
        "added": added,
        "retained": retained,
        "corrected": corrected,
        "corrections": corrections,
        "unresolved": unresolved,
        "coverage": sum(1 for c in cards if c.get("jerseyNumber") is not None),
        "total": len(cards),
    }
    report_path = ROOT / "scripts/jersey-number-enrichment-report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    if unresolved:
        print(f"UNRESOLVED: {len(unresolved)}")
        for item in unresolved:
            print(item)
        raise SystemExit(1)

    DATA_PATH.write_text(json.dumps(cards, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
