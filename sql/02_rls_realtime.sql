-- ══════════════════════════════════════════════════════
-- CIFRA URBANA: O Enigma do Corvo
-- 02_rls_realtime.sql — Segurança e Realtime
-- Execute APÓS 01_schema.sql
-- ══════════════════════════════════════════════════════

-- ─── RLS: Proteger solução dos casos ──────────────────
-- O cliente NUNCA deve ler solution_who/how/why/explanation
-- Essas colunas só chegam ao browser quando status = RESOLUTION/ENDED
-- via endpoint server-side com service_role

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Bloqueia SELECT direto via anon key
CREATE POLICY "cases_anon_block"
  ON cases
  FOR SELECT
  TO anon
  USING (false);

-- service_role (server-side) lê tudo
CREATE POLICY "cases_service_role"
  ON cases
  FOR SELECT
  TO service_role
  USING (true);

-- View pública sem solução (use no frontend se precisar listar casos)
CREATE OR REPLACE VIEW cases_public AS
  SELECT
    id,
    slug,
    title,
    narrative_intro,
    difficulty,
    max_turns,
    max_errors,
    recommended_players_min,
    recommended_players_max,
    created_at
  FROM cases;

-- ─── RLS: Demais tabelas (acesso liberado via service_role) ─

-- locations: leitura pública OK (sem dados sensíveis)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_public_read" ON locations FOR SELECT TO anon USING (true);
CREATE POLICY "locations_service_write" ON locations FOR ALL TO service_role USING (true);

-- characters: leitura pública OK
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "characters_public_read" ON characters FOR SELECT TO anon USING (true);
CREATE POLICY "characters_service_write" ON characters FOR ALL TO service_role USING (true);

-- clues: anon não lê diretamente (só via endpoint que registra descoberta)
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clues_anon_block" ON clues FOR SELECT TO anon USING (false);
CREATE POLICY "clues_service_role" ON clues FOR ALL TO service_role USING (true);

-- rooms, players, discovered_clues, player_actions, guesses:
-- escrita só via service_role (Route Handlers server-side)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_anon_read" ON rooms FOR SELECT TO anon USING (true);
CREATE POLICY "rooms_service_write" ON rooms FOR ALL TO service_role USING (true);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_anon_read" ON players FOR SELECT TO anon USING (true);
CREATE POLICY "players_service_write" ON players FOR ALL TO service_role USING (true);

ALTER TABLE discovered_clues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disc_clues_anon_read" ON discovered_clues FOR SELECT TO anon USING (true);
CREATE POLICY "disc_clues_service_write" ON discovered_clues FOR ALL TO service_role USING (true);

ALTER TABLE player_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "actions_anon_read" ON player_actions FOR SELECT TO anon USING (true);
CREATE POLICY "actions_service_write" ON player_actions FOR ALL TO service_role USING (true);

ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guesses_anon_block" ON guesses FOR SELECT TO anon USING (false);
CREATE POLICY "guesses_service_role" ON guesses FOR ALL TO service_role USING (true);

ALTER TABLE location_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conn_public_read" ON location_connections FOR SELECT TO anon USING (true);
CREATE POLICY "conn_service_write" ON location_connections FOR ALL TO service_role USING (true);

-- ─── REALTIME: habilitar nas tabelas que o jogo escuta ─

ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE discovered_clues;
ALTER PUBLICATION supabase_realtime ADD TABLE player_actions;
