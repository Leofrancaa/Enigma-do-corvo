-- ══════════════════════════════════════════════════════
-- CIFRA URBANA: O Enigma do Corvo
-- 01_schema.sql — Criação do banco
-- Execute no SQL Editor do Supabase (banco zerado)
-- ══════════════════════════════════════════════════════

-- ─── ENUMS ────────────────────────────────────────────

CREATE TYPE room_status AS ENUM (
  'LOBBY',
  'CHARACTER_SELECT',
  'CASE_INTRO',
  'INVESTIGATION',
  'DEDUCTION',
  'RESOLUTION',
  'ENDED',
  'ABANDONED'
);

CREATE TYPE transport_type AS ENUM (
  'drone',
  'hyperloop',
  'magrail'
);

CREATE TYPE clue_type AS ENUM (
  'analogia',
  'anagrama',
  'cifra',
  'referencia',
  'depoimento',
  'evidencia',
  'plot_twist'
);

CREATE TYPE reveals_field AS ENUM (
  'who',
  'where',
  'how',
  'why',
  'context'
);

CREATE TYPE difficulty AS ENUM (
  'facil',
  'medio',
  'dificil'
);

CREATE TYPE player_action_type AS ENUM (
  'move',
  'partial_guess',
  'final_guess',
  'skip_turn',
  'ready',
  'select_character',
  'start_game',
  'end_game',
  'force_deduction'
);

-- ─── MAPA FIXO (7 locais, mesmo para todos os jogos) ──

CREATE TABLE locations (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text        NOT NULL UNIQUE,
  name         text        NOT NULL,
  subtitle     text,
  description  text        NOT NULL,
  image_url    text,
  icon_url     text,
  map_x        numeric(5,4) NOT NULL DEFAULT 0.5,
  map_y        numeric(5,4) NOT NULL DEFAULT 0.5,
  is_start_hub boolean     NOT NULL DEFAULT false
);

CREATE TABLE location_connections (
  id             uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id        uuid           NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  to_id          uuid           NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  transport_type transport_type NOT NULL
);

CREATE INDEX idx_connections_from_id ON location_connections(from_id);

-- ─── PERSONAGENS ──────────────────────────────────────

CREATE TABLE characters (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  name         text NOT NULL,
  codename     text NOT NULL,
  specialty    text NOT NULL,
  personality  text NOT NULL,
  description  text NOT NULL,
  avatar_url   text,
  portrait_url text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── CASOS ────────────────────────────────────────────

CREATE TABLE cases (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    text        NOT NULL UNIQUE,
  title                   text        NOT NULL,
  narrative_intro         text        NOT NULL,
  difficulty              difficulty  NOT NULL DEFAULT 'medio',
  max_turns               int         NOT NULL DEFAULT 20,
  max_errors              int         NOT NULL DEFAULT 3,
  recommended_players_min int         NOT NULL DEFAULT 2,
  recommended_players_max int         NOT NULL DEFAULT 6,
  -- Solução: NUNCA exposta ao cliente via RLS
  solution_who            text        NOT NULL,
  solution_where_id       uuid        REFERENCES locations(id),
  solution_how            text        NOT NULL,
  solution_why            text        NOT NULL,
  solution_explanation    text        NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── PISTAS ───────────────────────────────────────────

CREATE TABLE clues (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid          NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  location_id     uuid          NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type            clue_type     NOT NULL,
  display_content text          NOT NULL,
  decoded_hint    text,
  reveals_field   reveals_field NOT NULL,
  "order"         int           NOT NULL DEFAULT 0
);

CREATE INDEX idx_clues_case_id     ON clues(case_id);
CREATE INDEX idx_clues_location_id ON clues(location_id);

-- ─── SALAS ────────────────────────────────────────────

CREATE TABLE rooms (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text        NOT NULL UNIQUE,
  host_session_id   text        NOT NULL,
  status            room_status NOT NULL DEFAULT 'LOBBY',
  case_id           uuid        REFERENCES cases(id),
  current_turn      int         NOT NULL DEFAULT 0,
  max_turns         int         NOT NULL DEFAULT 20,
  errors_remaining  int         NOT NULL DEFAULT 3,
  -- FK circular adicionada depois da criação de players
  current_player_id uuid,
  created_at        timestamptz NOT NULL DEFAULT now(),
  started_at        timestamptz,
  ended_at          timestamptz
);

CREATE INDEX idx_rooms_code   ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);

-- ─── JOGADORES ────────────────────────────────────────

CREATE TABLE players (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id             uuid        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  session_id          text        NOT NULL,
  nickname            text        NOT NULL,
  character_id        uuid        REFERENCES characters(id),
  current_location_id uuid        REFERENCES locations(id),
  tickets_drone       int         NOT NULL DEFAULT 4,
  tickets_hyperloop   int         NOT NULL DEFAULT 3,
  tickets_magrail     int         NOT NULL DEFAULT 2,
  score               int         NOT NULL DEFAULT 0,
  is_host             boolean     NOT NULL DEFAULT false,
  is_connected        boolean     NOT NULL DEFAULT true,
  turn_order          int,
  joined_at           timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_players_room_session   ON players(room_id, session_id);
CREATE        INDEX idx_players_room_id        ON players(room_id);
-- Um personagem por sala (NULL permitido = ainda não escolheu)
CREATE UNIQUE INDEX idx_players_room_character ON players(room_id, character_id)
  WHERE character_id IS NOT NULL;

-- Resolver referência circular rooms ↔ players
ALTER TABLE rooms
  ADD CONSTRAINT fk_rooms_current_player
  FOREIGN KEY (current_player_id) REFERENCES players(id);

-- ─── PISTAS DESCOBERTAS ───────────────────────────────

CREATE TABLE discovered_clues (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id     uuid        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  clue_id       uuid        NOT NULL REFERENCES clues(id) ON DELETE CASCADE,
  discovered_at timestamptz NOT NULL DEFAULT now()
);

-- Uma pista descoberta uma vez é visível para todos na sala
CREATE UNIQUE INDEX idx_discovered_room_clue ON discovered_clues(room_id, clue_id);
CREATE        INDEX idx_discovered_room_id   ON discovered_clues(room_id);

-- ─── LOG DE AÇÕES (auditoria + idempotência) ──────────

CREATE TABLE player_actions (
  id               uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  client_action_id uuid               NOT NULL UNIQUE,
  room_id          uuid               NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id        uuid               NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  type             player_action_type NOT NULL,
  payload          jsonb,
  turn             int                NOT NULL DEFAULT 0,
  created_at       timestamptz        NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_actions_client_id ON player_actions(client_action_id);
CREATE        INDEX idx_actions_room_id   ON player_actions(room_id);

-- ─── PALPITES ─────────────────────────────────────────

CREATE TABLE guesses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id     uuid        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  who           text,
  where_id      uuid        REFERENCES locations(id),
  how           text,
  why           text,
  is_final      boolean     NOT NULL DEFAULT false,
  is_correct    boolean,
  score_awarded int,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_guesses_room_id ON guesses(room_id);
