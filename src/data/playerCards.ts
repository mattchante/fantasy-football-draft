/**
 * normalizedValue = 40 + (percentileWithinPosition * 55)
 * Computed automatically from fantasy points per position group.
 */
import type { PlayerCard, PlayerStats, PlayerStatus, Position } from '../types';
import { calculatePPR, calculatePPG } from '../lib/fantasyScoring';
import { JERSEY_NUMBERS } from './jerseyNumbers';

interface CardDef {
  id: string;
  playerId: string;
  name: string;
  position: Position;
  team: string;
  status: PlayerStatus;
  season: number;
  stats: PlayerStats;
  headlineStats: string[];
  flavorTag: string;
  badges: string[];
  categoryIds: string[];
  mvpEligible: boolean;
}

function imageUrl(name: string): string {
  return `https://placehold.co/400x500/1a1a2e/e2e8f0?text=${encodeURIComponent(name.split(' ').pop() ?? name)}`;
}

const CARD_DEFS: CardDef[] = [
  // QBs
  { id: 'peyton-manning-2013', playerId: 'peyton-manning', name: 'Peyton Manning', position: 'QB', team: 'DEN', status: 'legend', season: 2013, stats: { passYds: 5477, passTD: 55, interceptions: 10, rushYds: -8, rushTD: 0, games: 16 }, headlineStats: ['5,477 Pass Yds', '55 Pass TD'], flavorTag: 'Record Breaker', badges: ['MVP'], categoryIds: ['field-generals', 'touchdown-merchants', 'mvp-showcase'], mvpEligible: true },
  { id: 'tom-brady-2007', playerId: 'tom-brady', name: 'Tom Brady', position: 'QB', team: 'NE', status: 'legend', season: 2007, stats: { passYds: 4828, passTD: 50, interceptions: 8, rushYds: 98, rushTD: 3, games: 16 }, headlineStats: ['4,828 Pass Yds', '50 Pass TD'], flavorTag: 'Touchdown Merchant', badges: ['MVP'], categoryIds: ['field-generals', 'touchdown-merchants', 'mvp-showcase'], mvpEligible: true },
  { id: 'lamar-jackson-2019', playerId: 'lamar-jackson', name: 'Lamar Jackson', position: 'QB', team: 'BAL', status: 'legend', season: 2019, stats: { passYds: 3127, passTD: 36, interceptions: 6, rushYds: 1206, rushTD: 7, games: 15 }, headlineStats: ['1,206 Rush Yds', '36 Pass TD'], flavorTag: 'Dual Threat', badges: ['MVP'], categoryIds: ['field-generals', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'patrick-mahomes-2022', playerId: 'patrick-mahomes', name: 'Patrick Mahomes', position: 'QB', team: 'KC', status: 'current', season: 2022, stats: { passYds: 5250, passTD: 41, interceptions: 12, rushYds: 358, rushTD: 4, games: 17 }, headlineStats: ['5,250 Pass Yds', '41 Pass TD'], flavorTag: 'Fantasy Cheat Code', badges: ['MVP'], categoryIds: ['field-generals', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'josh-allen-2024', playerId: 'josh-allen', name: 'Josh Allen', position: 'QB', team: 'BUF', status: 'current', season: 2024, stats: { passYds: 4306, passTD: 28, interceptions: 6, rushYds: 531, rushTD: 12, games: 17 }, headlineStats: ['531 Rush Yds', '12 Rush TD'], flavorTag: 'Dual Threat', badges: [], categoryIds: ['field-generals', 'current-superstars', 'touchdown-merchants'], mvpEligible: true },
  { id: 'aaron-rodgers-2011', playerId: 'aaron-rodgers', name: 'Aaron Rodgers', position: 'QB', team: 'GB', status: 'legend', season: 2011, stats: { passYds: 4643, passTD: 45, interceptions: 6, rushYds: 134, rushTD: 2, games: 15 }, headlineStats: ['45 Pass TD', '122.5 Rating'], flavorTag: 'Precision Passer', badges: ['MVP'], categoryIds: ['field-generals', 'mvp-showcase'], mvpEligible: true },
  { id: 'drew-brees-2011', playerId: 'drew-brees', name: 'Drew Brees', position: 'QB', team: 'NO', status: 'legend', season: 2011, stats: { passYds: 5476, passTD: 46, interceptions: 14, rushYds: 86, rushTD: 1, games: 16 }, headlineStats: ['5,476 Pass Yds', '46 Pass TD'], flavorTag: 'Volume Passer', badges: [], categoryIds: ['field-generals', 'ppr-machines'], mvpEligible: true },
  { id: 'dan-marino-1984', playerId: 'dan-marino', name: 'Dan Marino', position: 'QB', team: 'MIA', status: 'legend', season: 1984, stats: { passYds: 5084, passTD: 48, interceptions: 17, rushYds: -5, rushTD: 0, games: 16 }, headlineStats: ['5,084 Pass Yds', '48 Pass TD'], flavorTag: 'Pioneer', badges: [], categoryIds: ['field-generals'], mvpEligible: true },
  { id: 'joe-burrow-2024', playerId: 'joe-burrow', name: 'Joe Burrow', position: 'QB', team: 'CIN', status: 'current', season: 2024, stats: { passYds: 4918, passTD: 43, interceptions: 9, rushYds: 201, rushTD: 2, games: 17 }, headlineStats: ['4,918 Pass Yds', '43 Pass TD'], flavorTag: 'Deep Ball Artist', badges: [], categoryIds: ['field-generals', 'current-superstars', 'deep-threats'], mvpEligible: true },
  { id: 'justin-herbert-2024', playerId: 'justin-herbert', name: 'Justin Herbert', position: 'QB', team: 'LAC', status: 'current', season: 2024, stats: { passYds: 3870, passTD: 23, interceptions: 3, rushYds: 306, rushTD: 2, games: 17 }, headlineStats: ['3,870 Pass Yds', '3 INT'], flavorTag: 'Chain Mover', badges: [], categoryIds: ['field-generals', 'current-superstars'], mvpEligible: false },
  { id: 'jalen-hurts-2024', playerId: 'jalen-hurts', name: 'Jalen Hurts', position: 'QB', team: 'PHI', status: 'current', season: 2024, stats: { passYds: 2903, passTD: 18, interceptions: 5, rushYds: 605, rushTD: 14, games: 17 }, headlineStats: ['605 Rush Yds', '14 Rush TD'], flavorTag: 'Goal Line Threat', badges: [], categoryIds: ['field-generals', 'touchdown-merchants', 'current-superstars'], mvpEligible: true },
  { id: 'matthew-stafford-2011', playerId: 'matthew-stafford', name: 'Matthew Stafford', position: 'QB', team: 'DET', status: 'legend', season: 2011, stats: { passYds: 5038, passTD: 41, interceptions: 16, rushYds: 58, rushTD: 0, games: 16 }, headlineStats: ['5,038 Pass Yds', '41 Pass TD'], flavorTag: 'Volume Monster', badges: [], categoryIds: ['field-generals'], mvpEligible: false },
  { id: 'dak-prescott-2023', playerId: 'dak-prescott', name: 'Dak Prescott', position: 'QB', team: 'DAL', status: 'current', season: 2023, stats: { passYds: 4516, passTD: 36, interceptions: 9, rushYds: 242, rushTD: 2, games: 17 }, headlineStats: ['4,516 Pass Yds', '36 Pass TD'], flavorTag: 'Consistent Producer', badges: [], categoryIds: ['field-generals', 'reliable-guys'], mvpEligible: false },
  { id: 'kirk-cousins-2024', playerId: 'kirk-cousins', name: 'Kirk Cousins', position: 'QB', team: 'ATL', status: 'current', season: 2024, stats: { passYds: 3508, passTD: 18, interceptions: 16, rushYds: 25, rushTD: 0, games: 14 }, headlineStats: ['3,508 Pass Yds', '18 Pass TD'], flavorTag: 'Reliable Guy', badges: [], categoryIds: ['field-generals', 'reliable-guys'], mvpEligible: false },

  // RBs
  { id: 'christian-mccaffrey-2023', playerId: 'christian-mccaffrey', name: 'Christian McCaffrey', position: 'RB', team: 'SF', status: 'current', season: 2023, stats: { rushYds: 1459, rushTD: 14, receptions: 67, recYds: 564, recTD: 7, games: 16 }, headlineStats: ['1,459 Rush Yds', '67 Rec'], flavorTag: 'PPR Machine', badges: ['OPOY'], categoryIds: ['ppr-machines', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'austin-ekeler-2022', playerId: 'austin-ekeler', name: 'Austin Ekeler', position: 'RB', team: 'LAC', status: 'legend', season: 2022, stats: { rushYds: 915, rushTD: 13, receptions: 107, recYds: 722, recTD: 5, games: 17 }, headlineStats: ['107 Rec', '722 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines', 'reliable-guys'], mvpEligible: true },
  { id: 'derrick-henry-2020', playerId: 'derrick-henry', name: 'Derrick Henry', position: 'RB', team: 'TEN', status: 'legend', season: 2020, stats: { rushYds: 2027, rushTD: 17, receptions: 19, recYds: 114, recTD: 0, games: 16 }, headlineStats: ['2,027 Rush Yds', '17 Rush TD'], flavorTag: 'Bell Cow', badges: [], categoryIds: ['bell-cows', 'old-school-workhorses', 'mvp-showcase'], mvpEligible: true },
  { id: 'saquon-barkley-2024', playerId: 'saquon-barkley', name: 'Saquon Barkley', position: 'RB', team: 'PHI', status: 'current', season: 2024, stats: { rushYds: 2005, rushTD: 13, receptions: 33, recYds: 278, recTD: 2, games: 16 }, headlineStats: ['2,005 Rush Yds', '13 Rush TD'], flavorTag: 'Bell Cow', badges: [], categoryIds: ['bell-cows', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'marshawn-lynch-2013', playerId: 'marshawn-lynch', name: 'Marshawn Lynch', position: 'RB', team: 'SEA', status: 'legend', season: 2013, stats: { rushYds: 1257, rushTD: 11, receptions: 36, recYds: 316, recTD: 0, games: 16 }, headlineStats: ['1,257 Rush Yds', '11 Rush TD'], flavorTag: 'Beast Mode', badges: [], categoryIds: ['reliable-guys', 'old-school-workhorses', 'bell-cows'], mvpEligible: false },
  { id: 'marshall-faulk-2000', playerId: 'marshall-faulk', name: 'Marshall Faulk', position: 'RB', team: 'STL', status: 'legend', season: 2000, stats: { rushYds: 1439, rushTD: 18, receptions: 81, recYds: 830, recTD: 2, games: 16 }, headlineStats: ['81 Rec', '830 Rec Yds'], flavorTag: 'Dual Threat', badges: ['MVP'], categoryIds: ['ppr-machines', 'old-school-workhorses', 'mvp-showcase'], mvpEligible: true },
  { id: 'ladainian-tomlinson-2006', playerId: 'ladainian-tomlinson', name: 'LaDainian Tomlinson', position: 'RB', team: 'SD', status: 'legend', season: 2006, stats: { rushYds: 1815, rushTD: 28, receptions: 56, recYds: 508, recTD: 3, games: 16 }, headlineStats: ['28 Rush TD', '1,815 Rush Yds'], flavorTag: 'Touchdown Merchant', badges: ['MVP'], categoryIds: ['touchdown-merchants', 'old-school-workhorses', 'mvp-showcase'], mvpEligible: true },
  { id: 'adrian-peterson-2012', playerId: 'adrian-peterson', name: 'Adrian Peterson', position: 'RB', team: 'MIN', status: 'legend', season: 2012, stats: { rushYds: 2097, rushTD: 12, receptions: 40, recYds: 217, recTD: 0, games: 16 }, headlineStats: ['2,097 Rush Yds', '12 Rush TD'], flavorTag: 'Workhorse', badges: ['MVP'], categoryIds: ['bell-cows', 'old-school-workhorses', 'mvp-showcase'], mvpEligible: true },
  { id: 'jamaal-charles-2013', playerId: 'jamaal-charles', name: 'Jamaal Charles', position: 'RB', team: 'KC', status: 'legend', season: 2013, stats: { rushYds: 1043, rushTD: 9, receptions: 71, recYds: 673, recTD: 4, games: 15 }, headlineStats: ['71 Rec', '673 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines', 'reliable-guys'], mvpEligible: false },
  { id: 'alvin-kamara-2020', playerId: 'alvin-kamara', name: 'Alvin Kamara', position: 'RB', team: 'NO', status: 'legend', season: 2020, stats: { rushYds: 932, rushTD: 6, receptions: 83, recYds: 756, recTD: 5, games: 15 }, headlineStats: ['83 Rec', '756 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines', 'current-superstars'], mvpEligible: true },
  { id: 'nick-chubb-2022', playerId: 'nick-chubb', name: 'Nick Chubb', position: 'RB', team: 'CLE', status: 'current', season: 2022, stats: { rushYds: 1525, rushTD: 12, receptions: 43, recYds: 302, recTD: 1, games: 17 }, headlineStats: ['1,525 Rush Yds', '12 Rush TD'], flavorTag: 'Bell Cow', badges: [], categoryIds: ['bell-cows', 'reliable-guys'], mvpEligible: false },
  { id: 'jonathan-taylor-2021', playerId: 'jonathan-taylor', name: 'Jonathan Taylor', position: 'RB', team: 'IND', status: 'current', season: 2021, stats: { rushYds: 1811, rushTD: 18, receptions: 40, recYds: 360, recTD: 2, games: 17 }, headlineStats: ['18 Rush TD', '1,811 Rush Yds'], flavorTag: 'Touchdown Merchant', badges: [], categoryIds: ['touchdown-merchants', 'bell-cows', 'current-superstars'], mvpEligible: true },
  { id: 'kareem-hunt-2017', playerId: 'kareem-hunt', name: 'Kareem Hunt', position: 'RB', team: 'KC', status: 'legend', season: 2017, stats: { rushYds: 1327, rushTD: 8, receptions: 53, recYds: 408, recTD: 1, games: 16 }, headlineStats: ['1,327 Rush Yds', '53 Rec'], flavorTag: 'PPR Machine', badges: ['OROY'], categoryIds: ['ppr-machines', 'reliable-guys'], mvpEligible: false },
  { id: 'ezekiel-elliott-2018', playerId: 'ezekiel-elliott', name: 'Ezekiel Elliott', position: 'RB', team: 'DAL', status: 'legend', season: 2018, stats: { rushYds: 1434, rushTD: 6, receptions: 77, recYds: 567, recTD: 3, games: 15 }, headlineStats: ['77 Rec', '1,434 Rush Yds'], flavorTag: 'Volume Monster', badges: [], categoryIds: ['ppr-machines', 'bell-cows'], mvpEligible: false },
  { id: 'james-cook-2024', playerId: 'james-cook', name: 'James Cook', position: 'RB', team: 'BUF', status: 'current', season: 2024, stats: { rushYds: 1009, rushTD: 16, receptions: 32, recYds: 258, recTD: 2, games: 16 }, headlineStats: ['16 Rush TD', '1,009 Rush Yds'], flavorTag: 'Touchdown Merchant', badges: [], categoryIds: ['touchdown-merchants', 'current-superstars'], mvpEligible: false },
  { id: 'bijan-robinson-2024', playerId: 'bijan-robinson', name: 'Bijan Robinson', position: 'RB', team: 'ATL', status: 'current', season: 2024, stats: { rushYds: 1456, rushTD: 14, receptions: 61, recYds: 431, recTD: 1, games: 17 }, headlineStats: ['1,456 Rush Yds', '61 Rec'], flavorTag: 'Complete Back', badges: [], categoryIds: ['bell-cows', 'ppr-machines', 'current-superstars'], mvpEligible: true },
  { id: 'deandre-swift-2024', playerId: 'deandre-swift', name: 'D\'Andre Swift', position: 'RB', team: 'CHI', status: 'current', season: 2024, stats: { rushYds: 959, rushTD: 6, receptions: 42, recYds: 386, recTD: 0, games: 17 }, headlineStats: ['959 Rush Yds', '42 Rec'], flavorTag: 'Reliable Guy', badges: [], categoryIds: ['reliable-guys', 'ppr-machines'], mvpEligible: false },
  { id: 'joe-mixon-2023', playerId: 'joe-mixon', name: 'Joe Mixon', position: 'RB', team: 'CIN', status: 'current', season: 2023, stats: { rushYds: 1034, rushTD: 9, receptions: 52, recYds: 376, recTD: 3, games: 14 }, headlineStats: ['1,034 Rush Yds', '52 Rec'], flavorTag: 'Chain Mover', badges: [], categoryIds: ['reliable-guys', 'ppr-machines'], mvpEligible: false },
  { id: 'isiah-pacheco-2023', playerId: 'isiah-pacheco', name: 'Isiah Pacheco', position: 'RB', team: 'KC', status: 'current', season: 2023, stats: { rushYds: 935, rushTD: 7, receptions: 44, recYds: 244, recTD: 2, games: 17 }, headlineStats: ['935 Rush Yds', '44 Rec'], flavorTag: 'Workhorse', badges: [], categoryIds: ['bell-cows', 'reliable-guys'], mvpEligible: false },
  { id: 'rachaad-white-2023', playerId: 'rachaad-white', name: 'Rachaad White', position: 'RB', team: 'TB', status: 'current', season: 2023, stats: { rushYds: 990, rushTD: 6, receptions: 64, recYds: 549, recTD: 3, games: 17 }, headlineStats: ['64 Rec', '549 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines'], mvpEligible: false },

  // WRs
  { id: 'jamaar-chase-2024', playerId: 'jamaar-chase', name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN', status: 'current', season: 2024, stats: { receptions: 127, recYds: 1708, recTD: 17, games: 17 }, headlineStats: ['127 Rec', '1,708 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'justin-jefferson-2022', playerId: 'justin-jefferson', name: 'Justin Jefferson', position: 'WR', team: 'MIN', status: 'current', season: 2022, stats: { receptions: 128, recYds: 1809, recTD: 8, games: 17 }, headlineStats: ['128 Rec', '1,809 Rec Yds'], flavorTag: 'Volume Monster', badges: [], categoryIds: ['ppr-machines', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'tyreek-hill-2023', playerId: 'tyreek-hill', name: 'Tyreek Hill', position: 'WR', team: 'MIA', status: 'current', season: 2023, stats: { receptions: 119, recYds: 1799, recTD: 13, games: 16 }, headlineStats: ['1,799 Rec Yds', '13 Rec TD'], flavorTag: 'Deep Threat', badges: [], categoryIds: ['deep-threats', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'randall-cobb-2014', playerId: 'randall-cobb', name: 'Randall Cobb', position: 'WR', team: 'GB', status: 'legend', season: 2014, stats: { receptions: 91, recYds: 1287, recTD: 12, games: 16 }, headlineStats: ['91 Rec', '12 Rec TD'], flavorTag: 'Reliable Guy', badges: [], categoryIds: ['reliable-guys', 'ppr-machines'], mvpEligible: false },
  { id: 'calvin-johnson-2011', playerId: 'calvin-johnson', name: 'Calvin Johnson', position: 'WR', team: 'DET', status: 'legend', season: 2011, stats: { receptions: 96, recYds: 1681, recTD: 16, games: 16 }, headlineStats: ['96 Rec', '16 Rec TD'], flavorTag: 'Megatron', badges: [], categoryIds: ['deep-threats', 'touchdown-merchants', 'mvp-showcase'], mvpEligible: true },
  { id: 'randy-moss-2007', playerId: 'randy-moss', name: 'Randy Moss', position: 'WR', team: 'NE', status: 'legend', season: 2007, stats: { receptions: 98, recYds: 1493, recTD: 23, games: 16 }, headlineStats: ['23 Rec TD', '1,493 Rec Yds'], flavorTag: 'Deep Threat', badges: [], categoryIds: ['deep-threats', 'touchdown-merchants', 'mvp-showcase'], mvpEligible: true },
  { id: 'jerry-rice-1995', playerId: 'jerry-rice', name: 'Jerry Rice', position: 'WR', team: 'SF', status: 'legend', season: 1995, stats: { receptions: 122, recYds: 1848, recTD: 15, games: 16 }, headlineStats: ['122 Rec', '1,848 Rec Yds'], flavorTag: 'GOAT', badges: [], categoryIds: ['ppr-machines', 'reliable-guys', 'mvp-showcase'], mvpEligible: true },
  { id: 'devonta-smith-2024', playerId: 'devonta-smith', name: 'DeVonta Smith', position: 'WR', team: 'PHI', status: 'current', season: 2024, stats: { receptions: 89, recYds: 833, recTD: 8, games: 17 }, headlineStats: ['89 Rec', '8 Rec TD'], flavorTag: 'Chain Mover', badges: [], categoryIds: ['reliable-guys', 'current-superstars'], mvpEligible: false },
  { id: 'ceedee-lamb-2023', playerId: 'ceedee-lamb', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', status: 'current', season: 2023, stats: { receptions: 135, recYds: 1749, recTD: 12, games: 17 }, headlineStats: ['135 Rec', '1,749 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'amon-ra-st-brown-2024', playerId: 'amon-ra-st-brown', name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', status: 'current', season: 2024, stats: { receptions: 115, recYds: 1263, recTD: 12, games: 17 }, headlineStats: ['115 Rec', '12 Rec TD'], flavorTag: 'Matchup Nightmare', badges: [], categoryIds: ['ppr-machines', 'reliable-guys', 'current-superstars'], mvpEligible: true },
  { id: 'aj-brown-2024', playerId: 'aj-brown', name: 'A.J. Brown', position: 'WR', team: 'PHI', status: 'current', season: 2024, stats: { receptions: 67, recYds: 1079, recTD: 7, games: 13 }, headlineStats: ['1,079 Rec Yds', '7 Rec TD'], flavorTag: 'Deep Threat', badges: [], categoryIds: ['deep-threats', 'current-superstars'], mvpEligible: true },
  { id: 'stefon-diggs-2022', playerId: 'stefon-diggs', name: 'Stefon Diggs', position: 'WR', team: 'BUF', status: 'legend', season: 2022, stats: { receptions: 108, recYds: 1429, recTD: 11, games: 16 }, headlineStats: ['108 Rec', '1,429 Rec Yds'], flavorTag: 'Route Runner', badges: [], categoryIds: ['ppr-machines', 'reliable-guys'], mvpEligible: true },
  { id: 'davante-adams-2022', playerId: 'davante-adams', name: 'Davante Adams', position: 'WR', team: 'LV', status: 'current', season: 2022, stats: { receptions: 100, recYds: 1516, recTD: 14, games: 17 }, headlineStats: ['100 Rec', '14 Rec TD'], flavorTag: 'Touchdown Merchant', badges: [], categoryIds: ['touchdown-merchants', 'ppr-machines'], mvpEligible: true },
  { id: 'mike-evans-2024', playerId: 'mike-evans', name: 'Mike Evans', position: 'WR', team: 'TB', status: 'current', season: 2024, stats: { receptions: 74, recYds: 1004, recTD: 11, games: 14 }, headlineStats: ['11 Rec TD', '1,004 Rec Yds'], flavorTag: 'Touchdown Merchant', badges: [], categoryIds: ['touchdown-merchants', 'reliable-guys'], mvpEligible: false },
  { id: 'dk-metcalf-2024', playerId: 'dk-metcalf', name: 'DK Metcalf', position: 'WR', team: 'SEA', status: 'current', season: 2024, stats: { receptions: 66, recYds: 992, recTD: 5, games: 17 }, headlineStats: ['992 Rec Yds', '5 Rec TD'], flavorTag: 'Deep Threat', badges: [], categoryIds: ['deep-threats'], mvpEligible: false },
  { id: 'terry-mclaurin-2024', playerId: 'terry-mclaurin', name: 'Terry McLaurin', position: 'WR', team: 'WAS', status: 'current', season: 2024, stats: { receptions: 82, recYds: 1096, recTD: 13, games: 17 }, headlineStats: ['13 Rec TD', '1,096 Rec Yds'], flavorTag: 'Matchup Nightmare', badges: [], categoryIds: ['touchdown-merchants', 'current-superstars'], mvpEligible: false },
  { id: 'garrett-wilson-2024', playerId: 'garrett-wilson', name: 'Garrett Wilson', position: 'WR', team: 'NYJ', status: 'current', season: 2024, stats: { receptions: 101, recYds: 1104, recTD: 7, games: 17 }, headlineStats: ['101 Rec', '1,104 Rec Yds'], flavorTag: 'Volume Monster', badges: [], categoryIds: ['ppr-machines', 'current-superstars'], mvpEligible: false },
  { id: 'puka-nacua-2024', playerId: 'puka-nacua', name: 'Puka Nacua', position: 'WR', team: 'LAR', status: 'current', season: 2024, stats: { receptions: 79, recYds: 990, recTD: 3, games: 11 }, headlineStats: ['79 Rec', '990 Rec Yds'], flavorTag: 'Chain Mover', badges: [], categoryIds: ['ppr-machines', 'current-superstars'], mvpEligible: true },
  { id: 'marvin-harrison-jr-2024', playerId: 'marvin-harrison-jr', name: 'Marvin Harrison Jr.', position: 'WR', team: 'ARI', status: 'current', season: 2024, stats: { receptions: 81, recYds: 885, recTD: 8, games: 17 }, headlineStats: ['81 Rec', '8 Rec TD'], flavorTag: 'Deep Threat', badges: [], categoryIds: ['deep-threats', 'current-superstars'], mvpEligible: false },
  { id: 'chris-olave-2024', playerId: 'chris-olave', name: 'Chris Olave', position: 'WR', team: 'NO', status: 'current', season: 2024, stats: { receptions: 70, recYds: 840, recTD: 3, games: 14 }, headlineStats: ['70 Rec', '840 Rec Yds'], flavorTag: 'Route Runner', badges: [], categoryIds: ['ppr-machines', 'reliable-guys'], mvpEligible: false },

  // TEs
  { id: 'rob-gronkowski-2011', playerId: 'rob-gronkowski', name: 'Rob Gronkowski', position: 'TE', team: 'NE', status: 'legend', season: 2011, stats: { receptions: 90, recYds: 1327, recTD: 17, games: 16 }, headlineStats: ['90 Rec', '17 Rec TD'], flavorTag: 'Matchup Nightmare', badges: [], categoryIds: ['reliable-guys', 'touchdown-merchants', 'mvp-showcase'], mvpEligible: true },
  { id: 'travis-kelce-2022', playerId: 'travis-kelce', name: 'Travis Kelce', position: 'TE', team: 'KC', status: 'current', season: 2022, stats: { receptions: 110, recYds: 1338, recTD: 12, games: 17 }, headlineStats: ['110 Rec', '1,338 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines', 'current-superstars', 'mvp-showcase'], mvpEligible: true },
  { id: 'george-kittle-2024', playerId: 'george-kittle', name: 'George Kittle', position: 'TE', team: 'SF', status: 'current', season: 2024, stats: { receptions: 78, recYds: 1106, recTD: 8, games: 15 }, headlineStats: ['78 Rec', '1,106 Rec Yds'], flavorTag: 'Matchup Nightmare', badges: [], categoryIds: ['reliable-guys', 'current-superstars', 'ppr-machines'], mvpEligible: true },
  { id: 'tony-gonzalez-2004', playerId: 'tony-gonzalez', name: 'Tony Gonzalez', position: 'TE', team: 'KC', status: 'legend', season: 2004, stats: { receptions: 102, recYds: 1258, recTD: 7, games: 16 }, headlineStats: ['102 Rec', '1,258 Rec Yds'], flavorTag: 'Volume Monster', badges: [], categoryIds: ['ppr-machines', 'reliable-guys', 'mvp-showcase'], mvpEligible: true },
  { id: 'antonio-gates-2004', playerId: 'antonio-gates', name: 'Antonio Gates', position: 'TE', team: 'SD', status: 'legend', season: 2004, stats: { receptions: 81, recYds: 964, recTD: 13, games: 15 }, headlineStats: ['13 Rec TD', '81 Rec'], flavorTag: 'Touchdown Merchant', badges: [], categoryIds: ['touchdown-merchants', 'reliable-guys'], mvpEligible: true },
  { id: 'mark-andrews-2021', playerId: 'mark-andrews', name: 'Mark Andrews', position: 'TE', team: 'BAL', status: 'current', season: 2021, stats: { receptions: 68, recYds: 861, recTD: 10, games: 17 }, headlineStats: ['68 Rec', '10 Rec TD'], flavorTag: 'Red Zone Threat', badges: [], categoryIds: ['touchdown-merchants', 'reliable-guys'], mvpEligible: false },
  { id: 'sam-laporta-2023', playerId: 'sam-laporta', name: 'Sam LaPorta', position: 'TE', team: 'DET', status: 'current', season: 2023, stats: { receptions: 86, recYds: 889, recTD: 10, games: 17 }, headlineStats: ['86 Rec', '10 Rec TD'], flavorTag: 'Rookie Sensation', badges: ['OROY'], categoryIds: ['ppr-machines', 'current-superstars'], mvpEligible: true },
  { id: 'tj-hockenson-2023', playerId: 'tj-hockenson', name: 'T.J. Hockenson', position: 'TE', team: 'MIN', status: 'current', season: 2023, stats: { receptions: 95, recYds: 960, recTD: 5, games: 15 }, headlineStats: ['95 Rec', '960 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines', 'reliable-guys'], mvpEligible: false },
  { id: 'kyle-pitts-2024', playerId: 'kyle-pitts', name: 'Kyle Pitts', position: 'TE', team: 'ATL', status: 'current', season: 2024, stats: { receptions: 47, recYds: 602, recTD: 4, games: 17 }, headlineStats: ['47 Rec', '602 Rec Yds'], flavorTag: 'Mismatch Weapon', badges: [], categoryIds: ['deep-threats', 'current-superstars'], mvpEligible: false },
  { id: 'evan-engram-2023', playerId: 'evan-engram', name: 'Evan Engram', position: 'TE', team: 'JAX', status: 'current', season: 2023, stats: { receptions: 114, recYds: 963, recTD: 4, games: 17 }, headlineStats: ['114 Rec', '963 Rec Yds'], flavorTag: 'PPR Machine', badges: [], categoryIds: ['ppr-machines'], mvpEligible: false },
  { id: 'dallas-goedert-2024', playerId: 'dallas-goedert', name: 'Dallas Goedert', position: 'TE', team: 'PHI', status: 'current', season: 2024, stats: { receptions: 42, recYds: 496, recTD: 2, games: 14 }, headlineStats: ['42 Rec', '496 Rec Yds'], flavorTag: 'Reliable Guy', badges: [], categoryIds: ['reliable-guys'], mvpEligible: false },
  { id: 'zach-ertz-2018', playerId: 'zach-ertz', name: 'Zach Ertz', position: 'TE', team: 'PHI', status: 'legend', season: 2018, stats: { receptions: 116, recYds: 1163, recTD: 8, games: 16 }, headlineStats: ['116 Rec', '1,163 Rec Yds'], flavorTag: 'Volume Monster', badges: [], categoryIds: ['ppr-machines', 'reliable-guys'], mvpEligible: false },
];

function computeNormalizedValues(cards: PlayerCard[]): PlayerCard[] {
  const byPosition = new Map<Position, PlayerCard[]>();
  for (const card of cards) {
    const group = byPosition.get(card.position) ?? [];
    group.push(card);
    byPosition.set(card.position, group);
  }

  for (const [, group] of byPosition) {
    const sorted = [...group].sort((a, b) => a.fantasyPoints - b.fantasyPoints);
    sorted.forEach((card, index) => {
      const percentile = sorted.length === 1 ? 1 : index / (sorted.length - 1);
      card.normalizedValue = Math.round((40 + percentile * 55) * 10) / 10;
    });
  }

  return cards;
}

function buildCards(): PlayerCard[] {
  const cards: PlayerCard[] = CARD_DEFS.map((def) => {
    const fantasyPoints = Math.round(calculatePPR(def.stats) * 10) / 10;
    const fantasyPointsPerGame = calculatePPG(def.stats, fantasyPoints);

    return {
      ...def,
      imageUrl: imageUrl(def.name),
      fantasyPoints,
      fantasyPointsPerGame,
      normalizedValue: 0,
      jerseyNumber: JERSEY_NUMBERS[def.id],
    };
  });

  return computeNormalizedValues(cards);
}

export const PLAYER_CARDS: PlayerCard[] = buildCards();

export const PLAYER_CARD_MAP: Map<string, PlayerCard> = new Map(
  PLAYER_CARDS.map((c) => [c.id, c]),
);

export function getCardById(id: string): PlayerCard | undefined {
  return PLAYER_CARD_MAP.get(id);
}

export function getMvpEligibleCards(): PlayerCard[] {
  return PLAYER_CARDS.filter((c) => c.mvpEligible);
}

export function getCardsByCategory(categoryId: string): PlayerCard[] {
  return PLAYER_CARDS.filter((c) => c.categoryIds.includes(categoryId));
}
