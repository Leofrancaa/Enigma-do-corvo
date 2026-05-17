-- ══════════════════════════════════════════════════════
-- CIFRA URBANA — 06_add_grid_position.sql
-- Adiciona posição na grade (tabuleiro 2D)
-- Execute no Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- Posição do jogador no tabuleiro (linha e coluna da grade)
ALTER TABLE players ADD COLUMN IF NOT EXISTS grid_row int NOT NULL DEFAULT 10;
ALTER TABLE players ADD COLUMN IF NOT EXISTS grid_col int NOT NULL DEFAULT 9;

-- Slug do local onde o jogador está atualmente (null = no caminho)
ALTER TABLE players ADD COLUMN IF NOT EXISTS in_location_slug text;
