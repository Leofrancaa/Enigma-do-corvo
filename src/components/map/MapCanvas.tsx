"use client";

import {
  BOARD_GRID,
  BOARD_ROWS,
  BOARD_COLS,
  CELL_PX,
  ROOM_RECTS,
  ENTRY_DIRECTION,
  isRoomCell,
  isEntryCell,
} from "@/lib/game/board";
import type { Location } from "@/types/game";

// Detective noir palette
const PLAYER_COLORS = ["#f59e0b", "#ef4444", "#a855f7", "#22c55e", "#3b82f6", "#ec4899"];
const PATH_COLOR    = "#1e1e28";
const PATH_STROKE   = "#2a2a38";
const ENTRY_BG      = "#151520";
const BOARD_BG      = "#0f0e0b";
const BOARD_BORDER  = "#78350f";
const REACH_FILL    = "rgba(245,158,11,0.18)";
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

function ArrowPath({ direction, cx, cy, size }: { direction: string; cx: number; cy: number; size: number }) {
  const h = size * 0.5;
  switch (direction) {
    case "up":    return <polygon points={`${cx},${cy-h} ${cx-h},${cy+h} ${cx+h},${cy+h}`}   fill={ARROW_COLOR} opacity={0.9} />;
    case "down":  return <polygon points={`${cx},${cy+h} ${cx-h},${cy-h} ${cx+h},${cy-h}`}   fill={ARROW_COLOR} opacity={0.9} />;
    case "left":  return <polygon points={`${cx-h},${cy} ${cx+h},${cy-h} ${cx+h},${cy+h}`}   fill={ARROW_COLOR} opacity={0.9} />;
    case "right": return <polygon points={`${cx+h},${cy} ${cx-h},${cy-h} ${cx-h},${cy+h}`}   fill={ARROW_COLOR} opacity={0.9} />;
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
        {/* Background */}
        <rect width={SVG_W} height={SVG_H} fill={BOARD_BG} />

        {/* Board border */}
        <rect x={2} y={2} width={SVG_W-4} height={SVG_H-4} fill="none" stroke={BOARD_BORDER} strokeWidth={3} rx={6} />

        {/* ── Room images ── */}
        {Object.entries(ROOM_RECTS).map(([slug, [rs, re, cs, ce]]) => {
          const x = cs * CELL_PX;
          const y = rs * CELL_PX;
          const w = (ce - cs + 1) * CELL_PX;
          const h = (re - rs + 1) * CELL_PX;
          const loc = slugToLoc.get(slug);
          return (
            <g key={slug}>
              <rect x={x} y={y} width={w} height={h} fill="#0d1117" stroke={BOARD_BORDER} strokeWidth={1.5} rx={3} />
              {loc?.imageUrl && (
                <image
                  href={loc.imageUrl}
                  x={x+1} y={y+1}
                  width={w-2} height={h-2}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {/* Gradient overlay at bottom for legibility */}
              <defs>
                <linearGradient id={`grad-${slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="50%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
                </linearGradient>
              </defs>
              <rect x={x} y={y} width={w} height={h} fill={`url(#grad-${slug})`} rx={3} />
              {/* Name label */}
              <text
                x={x + w / 2}
                y={y + h - 8}
                textAnchor="middle"
                fontSize={Math.min(11, w / 7)}
                fontFamily="monospace"
                fontWeight="bold"
                fill="#fff"
                style={{ textShadow: "0 1px 4px #000" }}
              >
                {loc?.name ?? slug}
              </text>
            </g>
          );
        })}

        {/* ── Path & entry cells ── */}
        {BOARD_GRID.map((row, ri) =>
          row.map((code, ci) => {
            if (code === -1 || isRoomCell(code)) return null;

            const x = ci * CELL_PX;
            const y = ri * CELL_PX;
            const key = `${ri},${ci}`;
            const isReachable = reachableSet.has(key);
            const isEntry = isEntryCell(code);

            return (
              <g
                key={key}
                onClick={() => isReachable && onCellClick?.(ri, ci)}
                style={{ cursor: isReachable ? "pointer" : "default" }}
              >
                <rect
                  x={x+1} y={y+1}
                  width={CELL_PX-2} height={CELL_PX-2}
                  rx={5} ry={5}
                  fill={isReachable ? REACH_FILL : isEntry ? ENTRY_BG : PATH_COLOR}
                  stroke={isReachable ? REACH_STROKE : PATH_STROKE}
                  strokeWidth={isReachable ? 2 : 1}
                />
                {isReachable && (
                  <rect
                    x={x+1} y={y+1}
                    width={CELL_PX-2} height={CELL_PX-2}
                    rx={5} ry={5}
                    fill="none"
                    stroke={REACH_STROKE}
                    strokeWidth={1.5}
                    opacity={0.4}
                    className="animate-pulse"
                  />
                )}
                {isEntry && (
                  <ArrowPath
                    direction={ENTRY_DIRECTION[code] ?? "up"}
                    cx={x + CELL_PX / 2}
                    cy={y + CELL_PX / 2}
                    size={CELL_PX * 0.35}
                  />
                )}
              </g>
            );
          })
        )}

        {/* ── Player tokens ── */}
        {players.map((p, idx) => {
          const cx = p.gridCol * CELL_PX + CELL_PX / 2;
          const cy = p.gridRow * CELL_PX + CELL_PX / 2;
          const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length];
          // Stagger overlapping players
          const ox = (idx % 3 - 1) * 6;
          const oy = (Math.floor(idx / 3) - 0) * 6;

          return (
            <g key={p.id} transform={`translate(${ox},${oy})`}>
              {p.isMe && (
                <circle cx={cx} cy={cy} r={15} fill="none" stroke={color} strokeWidth={2.5} opacity={0.45} className="animate-ping" />
              )}
              <circle cx={cx} cy={cy} r={13} fill={color} stroke={BOARD_BG} strokeWidth={2.5} />
              <text x={cx} y={cy+4} textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#000">
                {p.nickname.charAt(0).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
