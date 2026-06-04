-- WorldCupLens — seed data for Supabase/Postgres.
-- Auto-generated from packages/data-providers/src/static/seed.
-- Run AFTER schema.sql. Idempotent: safe to re-run.

begin;

-- Teams
insert into teams (id, name, short_name, code, country_code, crest_url) values
  ('alg', 'Algeria', NULL, 'ALG', 'DZ', NULL),
  ('arg', 'Argentina', NULL, 'ARG', 'AR', NULL),
  ('ars', 'Arsenal', NULL, 'ARS', 'GB', NULL),
  ('atm', 'Atlético Madrid', NULL, 'ATM', 'ES', NULL),
  ('aus', 'Australia', NULL, 'AUS', 'AU', NULL),
  ('aut', 'Austria', NULL, 'AUT', 'AT', NULL),
  ('avl', 'Aston Villa', NULL, 'AVL', 'GB', NULL),
  ('bar', 'Barcelona', NULL, 'BAR', 'ES', NULL),
  ('bay', 'Bayern Munich', NULL, 'BAY', 'DE', NULL),
  ('bel', 'Belgium', NULL, 'BEL', 'BE', NULL),
  ('ben', 'Benfica', NULL, 'BEN', 'PT', NULL),
  ('bha', 'Brighton', NULL, 'BHA', 'GB', NULL),
  ('bra', 'Brazil', NULL, 'BRA', 'BR', NULL),
  ('can', 'Canada', NULL, 'CAN', 'CA', NULL),
  ('che', 'Chelsea', NULL, 'CHE', 'GB', NULL),
  ('civ', 'Côte d''Ivoire', NULL, 'CIV', 'CI', NULL),
  ('cmr', 'Cameroon', NULL, 'CMR', 'CM', NULL),
  ('col', 'Colombia', NULL, 'COL', 'CO', NULL),
  ('cri', 'Costa Rica', NULL, 'CRC', 'CR', NULL),
  ('cro', 'Croatia', NULL, 'CRO', 'HR', NULL),
  ('den', 'Denmark', NULL, 'DEN', 'DK', NULL),
  ('dor', 'Borussia Dortmund', NULL, 'DOR', 'DE', NULL),
  ('ecu', 'Ecuador', NULL, 'ECU', 'EC', NULL),
  ('egy', 'Egypt', NULL, 'EGY', 'EG', NULL),
  ('eng', 'England', NULL, 'ENG', 'GB', NULL),
  ('esp', 'Spain', NULL, 'ESP', 'ES', NULL),
  ('fra', 'France', NULL, 'FRA', 'FR', NULL),
  ('ger', 'Germany', NULL, 'GER', 'DE', NULL),
  ('gha', 'Ghana', NULL, 'GHA', 'GH', NULL),
  ('int', 'Inter Milan', NULL, 'INT', 'IT', NULL),
  ('irn', 'Iran', NULL, 'IRN', 'IR', NULL),
  ('ita', 'Italy', NULL, 'ITA', 'IT', NULL),
  ('jor', 'Jordan', NULL, 'JOR', 'JO', NULL),
  ('jpn', 'Japan', NULL, 'JPN', 'JP', NULL),
  ('juv', 'Juventus', NULL, 'JUV', 'IT', NULL),
  ('kor', 'South Korea', NULL, 'KOR', 'KR', NULL),
  ('ksa', 'Saudi Arabia', NULL, 'KSA', 'SA', NULL),
  ('lei', 'Bayer Leverkusen', NULL, 'LEV', 'DE', NULL),
  ('liv', 'Liverpool', NULL, 'LIV', 'GB', NULL),
  ('mar', 'Morocco', NULL, 'MAR', 'MA', NULL),
  ('mci', 'Manchester City', NULL, 'MCI', 'GB', NULL),
  ('mex', 'Mexico', NULL, 'MEX', 'MX', NULL),
  ('mil', 'AC Milan', NULL, 'MIL', 'IT', NULL),
  ('mun', 'Manchester United', NULL, 'MUN', 'GB', NULL),
  ('nap', 'Napoli', NULL, 'NAP', 'IT', NULL),
  ('ned', 'Netherlands', NULL, 'NED', 'NL', NULL),
  ('new', 'Newcastle United', NULL, 'NEW', 'GB', NULL),
  ('nga', 'Nigeria', NULL, 'NGA', 'NG', NULL),
  ('nor', 'Norway', NULL, 'NOR', 'NO', NULL),
  ('nzl', 'New Zealand', NULL, 'NZL', 'NZ', NULL),
  ('pan', 'Panama', NULL, 'PAN', 'PA', NULL),
  ('par', 'Paraguay', NULL, 'PAR', 'PY', NULL),
  ('per', 'Peru', NULL, 'PER', 'PE', NULL),
  ('pol', 'Poland', NULL, 'POL', 'PL', NULL),
  ('por', 'Portugal', NULL, 'POR', 'PT', NULL),
  ('psg', 'Paris Saint-Germain', NULL, 'PSG', 'FR', NULL),
  ('psv', 'PSV Eindhoven', NULL, 'PSV', 'NL', NULL),
  ('qat', 'Qatar', NULL, 'QAT', 'QA', NULL),
  ('rma', 'Real Madrid', NULL, 'RMA', 'ES', NULL),
  ('rsa', 'South Africa', NULL, 'RSA', 'ZA', NULL),
  ('sen', 'Senegal', NULL, 'SEN', 'SN', NULL),
  ('spo', 'Sporting CP', NULL, 'SPO', 'PT', NULL),
  ('srb', 'Serbia', NULL, 'SRB', 'RS', NULL),
  ('sui', 'Switzerland', NULL, 'SUI', 'CH', NULL),
  ('tot', 'Tottenham Hotspur', NULL, 'TOT', 'GB', NULL),
  ('tun', 'Tunisia', NULL, 'TUN', 'TN', NULL),
  ('tur', 'Turkey', NULL, 'TUR', 'TR', NULL),
  ('ukr', 'Ukraine', NULL, 'UKR', 'UA', NULL),
  ('uru', 'Uruguay', NULL, 'URU', 'UY', NULL),
  ('usa', 'United States', NULL, 'USA', 'US', NULL),
  ('uzb', 'Uzbekistan', NULL, 'UZB', 'UZ', NULL),
  ('ven', 'Venezuela', NULL, 'VEN', 'VE', NULL),
  ('wal', 'Wales', NULL, 'WAL', 'GB', NULL),
  ('whu', 'West Ham United', NULL, 'WHU', 'GB', NULL)
on conflict (id) do nothing;

-- Tournaments
insert into tournaments (id, slug, name, sport, competition, season, start_date, end_date, hosts, format) values
  ('world-cup-2026', 'world-cup-2026', 'FIFA World Cup 2026', 'football', 'FIFA World Cup', '2026', NULL, NULL, array['US', 'CA', 'MX'], '{"kind":"group-knockout","groups":[{"id":"A","name":"Group A","teamIds":["arg","cro","ecu","civ"]},{"id":"B","name":"Group B","teamIds":["fra","uru","aut","rsa"]},{"id":"C","name":"Group C","teamIds":["esp","col","pol","alg"]},{"id":"D","name":"Group D","teamIds":["eng","mar","wal","uzb"]},{"id":"E","name":"Group E","teamIds":["bra","sui","srb","jor"]},{"id":"F","name":"Group F","teamIds":["por","den","tun","cri"]},{"id":"G","name":"Group G","teamIds":["ned","jpn","cmr","pan"]},{"id":"H","name":"Group H","teamIds":["bel","sen","gha","nzl"]},{"id":"I","name":"Group I","teamIds":["ger","kor","nga","par"]},{"id":"J","name":"Group J","teamIds":["usa","ita","aus","ksa"]},{"id":"K","name":"Group K","teamIds":["mex","ukr","irn","qat"]},{"id":"L","name":"Group L","teamIds":["can","nor","egy","ven"]}],"advancePerGroup":2,"bestThirdsAdvance":8,"groupLegs":1,"knockoutLegs":1,"pointsForWin":3,"pointsForDraw":1}'::jsonb)
on conflict (id) do nothing;

insert into tournaments (id, slug, name, sport, competition, season, start_date, end_date, hosts, format) values
  ('euro-2024', 'euro-2024', 'UEFA Euro 2024', 'football', 'UEFA European Championship', '2024', NULL, NULL, array['DE'], '{"kind":"group-knockout","groups":[{"id":"A","name":"Group A","teamIds":["fra","aut","pol","wal"]},{"id":"B","name":"Group B","teamIds":["esp","ita","cro","srb"]},{"id":"C","name":"Group C","teamIds":["eng","den","sui","tur"]},{"id":"D","name":"Group D","teamIds":["por","ned","bel","ger"]}],"advancePerGroup":2,"groupLegs":1,"knockoutLegs":1,"pointsForWin":3,"pointsForDraw":1}'::jsonb)
on conflict (id) do nothing;

insert into tournaments (id, slug, name, sport, competition, season, start_date, end_date, hosts, format) values
  ('copa-america-2024', 'copa-america-2024', 'Copa América 2024', 'football', 'CONMEBOL Copa América', '2024', NULL, NULL, array['US'], '{"kind":"group-knockout","groups":[{"id":"A","name":"Group A","teamIds":["arg","bra","uru","col"]},{"id":"B","name":"Group B","teamIds":["usa","mex","per","ecu"]}],"advancePerGroup":2,"groupLegs":1,"knockoutLegs":1,"pointsForWin":3,"pointsForDraw":1}'::jsonb)
on conflict (id) do nothing;

insert into tournaments (id, slug, name, sport, competition, season, start_date, end_date, hosts, format) values
  ('champions-league-2025-26', 'champions-league-2025-26', 'UEFA Champions League 2025-26', 'football', 'UEFA Champions League', '2025-26', NULL, NULL, NULL, '{"kind":"league-phase-knockout","matchesPerTeam":8,"knockoutQualifiers":16,"knockoutLegs":2,"pointsForWin":3,"pointsForDraw":1}'::jsonb)
on conflict (id) do nothing;

insert into tournaments (id, slug, name, sport, competition, season, start_date, end_date, hosts, format) values
  ('premier-league-2025-26', 'premier-league-2025-26', 'Premier League 2025-26', 'football', 'Premier League', '2025-26', NULL, NULL, array['GB'], '{"kind":"league","legs":2,"pointsForWin":3,"pointsForDraw":1}'::jsonb)
on conflict (id) do nothing;

-- Tournament teams (ratings)
insert into tournament_teams (tournament_id, team_id, rating) values
  ('world-cup-2026', 'arg', 2105),
  ('world-cup-2026', 'cro', 1945),
  ('world-cup-2026', 'ecu', 1805),
  ('world-cup-2026', 'civ', 1680),
  ('world-cup-2026', 'fra', 2055),
  ('world-cup-2026', 'uru', 1940),
  ('world-cup-2026', 'aut', 1795),
  ('world-cup-2026', 'rsa', 1660),
  ('world-cup-2026', 'esp', 2045),
  ('world-cup-2026', 'col', 1925),
  ('world-cup-2026', 'pol', 1800),
  ('world-cup-2026', 'alg', 1705),
  ('world-cup-2026', 'eng', 2030),
  ('world-cup-2026', 'mar', 1915),
  ('world-cup-2026', 'wal', 1785),
  ('world-cup-2026', 'uzb', 1620),
  ('world-cup-2026', 'bra', 2025),
  ('world-cup-2026', 'sui', 1865),
  ('world-cup-2026', 'srb', 1775),
  ('world-cup-2026', 'jor', 1560),
  ('world-cup-2026', 'por', 2010),
  ('world-cup-2026', 'den', 1860),
  ('world-cup-2026', 'tun', 1760),
  ('world-cup-2026', 'cri', 1640),
  ('world-cup-2026', 'ned', 1990),
  ('world-cup-2026', 'jpn', 1850),
  ('world-cup-2026', 'cmr', 1755),
  ('world-cup-2026', 'pan', 1630),
  ('world-cup-2026', 'bel', 1975),
  ('world-cup-2026', 'sen', 1840),
  ('world-cup-2026', 'gha', 1745),
  ('world-cup-2026', 'nzl', 1500),
  ('world-cup-2026', 'ger', 1965),
  ('world-cup-2026', 'kor', 1810),
  ('world-cup-2026', 'nga', 1740),
  ('world-cup-2026', 'par', 1710),
  ('world-cup-2026', 'usa', 1875),
  ('world-cup-2026', 'ita', 1970),
  ('world-cup-2026', 'aus', 1735),
  ('world-cup-2026', 'ksa', 1660),
  ('world-cup-2026', 'mex', 1870),
  ('world-cup-2026', 'ukr', 1735),
  ('world-cup-2026', 'irn', 1700),
  ('world-cup-2026', 'qat', 1620),
  ('world-cup-2026', 'can', 1705),
  ('world-cup-2026', 'nor', 1765),
  ('world-cup-2026', 'egy', 1690),
  ('world-cup-2026', 'ven', 1650)
on conflict (tournament_id, team_id) do nothing;

insert into tournament_teams (tournament_id, team_id, rating) values
  ('euro-2024', 'fra', 2055),
  ('euro-2024', 'aut', 1795),
  ('euro-2024', 'pol', 1800),
  ('euro-2024', 'wal', 1785),
  ('euro-2024', 'esp', 2045),
  ('euro-2024', 'ita', 1970),
  ('euro-2024', 'cro', 1945),
  ('euro-2024', 'srb', 1775),
  ('euro-2024', 'eng', 2030),
  ('euro-2024', 'den', 1860),
  ('euro-2024', 'sui', 1865),
  ('euro-2024', 'tur', 1700),
  ('euro-2024', 'por', 2010),
  ('euro-2024', 'ned', 1990),
  ('euro-2024', 'bel', 1975),
  ('euro-2024', 'ger', 1965)
on conflict (tournament_id, team_id) do nothing;

insert into tournament_teams (tournament_id, team_id, rating) values
  ('copa-america-2024', 'arg', 2105),
  ('copa-america-2024', 'bra', 2025),
  ('copa-america-2024', 'uru', 1940),
  ('copa-america-2024', 'col', 1925),
  ('copa-america-2024', 'usa', 1875),
  ('copa-america-2024', 'mex', 1870),
  ('copa-america-2024', 'per', 1815),
  ('copa-america-2024', 'ecu', 1805)
on conflict (tournament_id, team_id) do nothing;

insert into tournament_teams (tournament_id, team_id, rating) values
  ('champions-league-2025-26', 'mci', 2010),
  ('champions-league-2025-26', 'rma', 2005),
  ('champions-league-2025-26', 'bay', 1985),
  ('champions-league-2025-26', 'liv', 1975),
  ('champions-league-2025-26', 'ars', 1965),
  ('champions-league-2025-26', 'bar', 1960),
  ('champions-league-2025-26', 'psg', 1950),
  ('champions-league-2025-26', 'int', 1935),
  ('champions-league-2025-26', 'che', 1910),
  ('champions-league-2025-26', 'atm', 1905),
  ('champions-league-2025-26', 'dor', 1885),
  ('champions-league-2025-26', 'juv', 1880),
  ('champions-league-2025-26', 'mun', 1870),
  ('champions-league-2025-26', 'tot', 1860),
  ('champions-league-2025-26', 'nap', 1855),
  ('champions-league-2025-26', 'mil', 1845),
  ('champions-league-2025-26', 'new', 1830),
  ('champions-league-2025-26', 'lei', 1865),
  ('champions-league-2025-26', 'avl', 1815),
  ('champions-league-2025-26', 'whu', 1780),
  ('champions-league-2025-26', 'bha', 1775),
  ('champions-league-2025-26', 'ben', 1820),
  ('champions-league-2025-26', 'spo', 1810),
  ('champions-league-2025-26', 'psv', 1795)
on conflict (tournament_id, team_id) do nothing;

insert into tournament_teams (tournament_id, team_id, rating) values
  ('premier-league-2025-26', 'mci', 2010),
  ('premier-league-2025-26', 'liv', 1975),
  ('premier-league-2025-26', 'ars', 1965),
  ('premier-league-2025-26', 'che', 1910),
  ('premier-league-2025-26', 'mun', 1870),
  ('premier-league-2025-26', 'tot', 1860),
  ('premier-league-2025-26', 'new', 1830),
  ('premier-league-2025-26', 'avl', 1815),
  ('premier-league-2025-26', 'whu', 1780),
  ('premier-league-2025-26', 'bha', 1775)
on conflict (tournament_id, team_id) do nothing;

commit;

