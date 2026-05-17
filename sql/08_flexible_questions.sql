-- ══════════════════════════════════════════════════════
-- 08_flexible_questions.sql
-- Adiciona perguntas flexíveis por caso e respostas dinâmicas
-- Execute no Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- Coluna questions no cases: array de {id, label, answer}
ALTER TABLE cases ADD COLUMN IF NOT EXISTS questions jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Coluna answers nos guesses: {questionId: resposta_do_jogador}
ALTER TABLE guesses ADD COLUMN IF NOT EXISTS answers jsonb DEFAULT '{}'::jsonb;
ALTER TABLE guesses ADD COLUMN IF NOT EXISTS correct_count integer DEFAULT 0;
ALTER TABLE guesses ADD COLUMN IF NOT EXISTS total_count  integer DEFAULT 0;
