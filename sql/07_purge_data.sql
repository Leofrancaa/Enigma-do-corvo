-- ══════════════════════════════════════════════════════
-- CIFRA URBANA — 07_purge_data.sql
-- Apaga APENAS os dados (mantém o schema e os enums)
-- Use para limpar dados antigos antes de re-seedar
-- !! USE APENAS EM DESENVOLVIMENTO !!
-- ══════════════════════════════════════════════════════

-- 1. Quebrar a referência circular rooms.current_player_id → players
UPDATE rooms SET current_player_id = NULL;

-- 2. Limpar em ordem inversa de dependência
DELETE FROM guesses;
DELETE FROM player_actions;
DELETE FROM discovered_clues;
DELETE FROM players;
DELETE FROM rooms;
DELETE FROM clues;
DELETE FROM cases;
DELETE FROM location_connections;
DELETE FROM locations;
DELETE FROM characters;

-- Após rodar este script, execute em sequência:
-- pnpm db:seed        → recria locais, personagens e conexões
-- pnpm db:seed-cases  → recria os 4 casos
