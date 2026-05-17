-- ══════════════════════════════════════════════════════
-- CIFRA URBANA — 05_add_dice.sql
-- Adiciona mecanica de dado ao sistema de movimento
-- Execute no Supabase SQL Editor APÓS 01_schema.sql
-- ══════════════════════════════════════════════════════

-- Dado atual da sala (NULL = ainda não rolou neste turno)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_dice int;
