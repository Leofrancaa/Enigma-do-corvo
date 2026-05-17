-- ══════════════════════════════════════════════════════
-- CIFRA URBANA: O Enigma do Corvo
-- 03_reset.sql — APAGA TUDO e recria do zero
-- !! USE APENAS EM DESENVOLVIMENTO !!
-- ══════════════════════════════════════════════════════

-- Derrubar tabelas na ordem inversa das dependências
DROP TABLE IF EXISTS guesses            CASCADE;
DROP TABLE IF EXISTS player_actions     CASCADE;
DROP TABLE IF EXISTS discovered_clues   CASCADE;
DROP TABLE IF EXISTS players            CASCADE;
DROP TABLE IF EXISTS rooms              CASCADE;
DROP TABLE IF EXISTS clues              CASCADE;
DROP TABLE IF EXISTS cases              CASCADE;
DROP TABLE IF EXISTS location_connections CASCADE;
DROP TABLE IF EXISTS locations          CASCADE;
DROP TABLE IF EXISTS characters         CASCADE;

-- Derrubar enums
DROP TYPE IF EXISTS room_status         CASCADE;
DROP TYPE IF EXISTS transport_type      CASCADE;
DROP TYPE IF EXISTS clue_type           CASCADE;
DROP TYPE IF EXISTS reveals_field       CASCADE;
DROP TYPE IF EXISTS difficulty          CASCADE;
DROP TYPE IF EXISTS player_action_type  CASCADE;

-- Derrubar views
DROP VIEW IF EXISTS cases_public        CASCADE;

-- Após rodar este script, execute em sequência:
-- 1. 01_schema.sql
-- 2. 02_rls_realtime.sql
-- 3. pnpm db:seed
-- 4. pnpm db:seed-cases
