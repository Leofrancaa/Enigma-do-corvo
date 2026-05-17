"use client";

import {
  BOARD_GRID,
  BOARD_ROWS,
  BOARD_COLS,
  CELL_PX,
  ROOM_RECTS,
  ENTRY_CODE_TO_SLUG,
  isRoomCell,
  isEntryCell,
} from "@/lib/game/board";
import type { Location } from "@/types/game";

const PLAYER_COLORS = ["#f59e0b", "#ef4444", "#a855f7", "#22c55e", "#3b82f6", "#ec4899"];
const PATH_COLOR    = "#1e1e28";
const PATH_STROKE   = "#2c2c3a";
const ENTRY_BG      = "#12121c";
const BOARD_BG      = "#0a0a0e";
const BOARD_BORDER  = "#78350f";
const REACH_FILL    = "rgba(245,158,11,0.22)";
const REACH_STROKE  = "#f59e0b";
const ARROW_COLOR   = "#f59e0b";

const SVG_W = BOARD_COLS * CELL_PX;
const SVG_H = BOARD_ROWS * CELL_PX;

interface PlayerDot {
  id: string;
  gridRow: number;
  gridCol: number;
  nickname: string;
  colorIndex: number;
  isMe: boolean;
  avatarUrl?: string | null;
}

interface Props {
  locations: Location[];
  players: PlayerDot[];
  reachable: Array<[number, number]>;
  onCellClick?: (row: number, col: number) => void;
}

/** Calcula a direção da seta baseada na posição da entrada relativa ao centro da sala */
function entryArrowDir(
  entryRow: number,
  entryCol: number,
  slug: string
): "up" | "down" | "left" | "right" {
  const rect = ROOM_RECTS[slug];
  if (!rect) return "up";
  const [rs, re, cs, ce] = rect;
  const centerRow = (rs + re) / 2;
  const centerCol = (cs + ce) / 2;
  const dRow = Math.abs(entryRow - centerRow);
  const dCol = Math.abs(entryCol - centerCol);
  if (dRow >= dCol) {
    return entryRow < centerRow ? "down" : "up";
  }
  return entryCol < centerCol ? "right" : "left";
}

function ArrowShape({ dir, cx, cy, s }: { dir: string; cx: number; cy: number; s: number }) {
  const h = s * 0.48;
  switch (dir) {
    case "up":    return <polygon points={`${cx},${cy-h} ${cx-h},${cy+h} ${cx+h},${cy+h}`}   fill={ARROW_COLOR} />;
    case "down":  return <polygon points={`${cx},${cy+h} ${cx-h},${cy-h} ${cx+h},${cy-h}`}   fill={ARROW_COLOR} />;
    case "left":  return <polygon points={`${cx-h},${cy} ${cx+h},${cy-h} ${cx+h},${cy+h}`}   fill={ARROW_COLOR} />;
    case "right": return <polygon points={`${cx+h},${cy} ${cx-h},${cy-h} ${cx-h},${cy+h}`}   fill={ARROW_COLOR} />;
    default:      return null;
  }
}

export function MapCanvas({ locations, players, reachable, onCellClick }: Props) {
  const reachableSet = new Set(reachable.map(([r, c]) => `${r},${c}`));
  const slugToLoc = new Map<string, Location>();
  for (const loc of locations) slugToLoc.set(loc.slug, loc);

  return (
    <div className="w-full h-full">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ width: "100%", height: "100%", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width={SVG_W} height={SVG_H} fill={BOARD_BG} />
        <rect x={2} y={2} width={SVG_W-4} height={SVG_H-4} fill="none" stroke={BOARD_BORDER} strokeWidth={3} rx={6} />

        {/* ── Imagens das salas (somente células de sala, nunca de entrada) ── */}
        {Object.entries(ROOM_RECTS).map(([slug, [rs, re, cs, ce]]) => {
          const x = cs * CELL_PX;
          const y = rs * CELL_PX;
          const w = (ce - cs + 1) * CELL_PX;
          const h = (re - rs + 1) * CELL_PX;
          const loc = slugToLoc.get(slug);
          const gradId = `g-${slug}`;
          return (
            <g key={slug}>
              <rect x={x} y={y} width={w} height={h} fill="#0d1117" stroke={BOARD_BORDER} strokeWidth={1.5} rx={3} />
              {loc?.imageUrl && (
                <image href={loc.imageUrl} x={x+1} y={y+1} width={w-2} height={h-2} preserveAspectRatio="xMidYMid slice" />
              )}
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="45%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.88)" />
                </linearGradient>
              </defs>
              <rect x={x} y={y} width={w} height={h} fill={`url(#${gradId})`} rx={3} />
              <text
                x={x + w / 2} y={y + h - 7}
                textAnchor="middle"
                fontSize={Math.min(11, Math.max(8, w / 8))}
                fontFamily="monospace" fontWeight="bold" fill="#fff"
              >
                {loc?.name ?? slug}
              </text>
            </g>
          );
        })}

        {/* ── Caminhos e entradas ── */}
        {BOARD_GRID.map((row, ri) =>
          row.map((code, ci) => {
            if (code === -1 || isRoomCell(code)) return null;

            const x = ci * CELL_PX;
            const y = ri * CELL_PX;
            const key = `${ri},${ci}`;
            const isReachable = reachableSet.has(key);
            const isEntry = isEntryCell(code);

            let fill = isReachable ? REACH_FILL : isEntry ? ENTRY_BG : PATH_COLOR;
            let stroke = isReachable ? REACH_STROKE : PATH_STROKE;
            let strokeW = isReachable ? 2 : 1;

            return (
              <g key={key} onClick={() => isReachable && onCellClick?.(ri, ci)}
                style={{ cursor: isReachable ? "pointer" : "default" }}>
                <rect x={x+1} y={y+1} width={CELL_PX-2} height={CELL_PX-2}
                  rx={5} fill={fill} stroke={stroke} strokeWidth={strokeW} />
                {isEntry && (() => {
                  const slug = ENTRY_CODE_TO_SLUG[code];
                  const dir = entryArrowDir(ri, ci, slug);
                  return <ArrowShape dir={dir} cx={x + CELL_PX/2} cy={y + CELL_PX/2} s={CELL_PX * 0.32} />;
                })()}
              </g>
            );
          })
        )}

        {/* ── Fichas dos jogadores ── */}
        {players.map((p, idx) => {
          const cx = p.gridCol * CELL_PX + CELL_PX / 2;
          const cy = p.gridRow * CELL_PX + CELL_PX / 2;
          const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length];
          // Separar tokens sobrepostos levemente
          const ox = idx === 0 ? 0 : idx === 1 ? 6 : idx === 2 ? -6 : idx === 3 ? 0 : idx === 4 ? 8 : -8;
          const oy = idx === 0 ? 0 : idx === 1 ? -5 : idx === 2 ? -5 : idx === 3 ? 5 : idx === 4 ? 0 : 0;

          return (
            <g key={p.id} transform={`translate(${ox},${oy})`}>
              {/* Anel "é você" — usa animate SVG nativo, sem CSS scaling */}
              {p.isMe && (
                <circle cx={cx} cy={cy} r={15} fill="none" stroke={color} strokeWidth={2.5}>
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r={12} fill={color} stroke={BOARD_BG} strokeWidth={2.5} />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10"
                fontFamily="monospace" fontWeight="bold" fill="#000">
                {p.nickname.charAt(0).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
