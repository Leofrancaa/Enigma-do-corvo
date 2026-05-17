"use client";

import { useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import {
  BOARD_GRID,
  BOARD_ROWS,
  BOARD_COLS,
  CELL_PX,
  ROOM_RECTS,
  ENTRY_DIRECTION,
  isNavigable,
  isRoomCell,
  isEntryCell,
} from "@/lib/game/board";
import type { Location } from "@/types/game";

const PLAYER_COLORS = ["#00e5ff", "#ff2a6d", "#a855f7", "#22c55e", "#f59e0b", "#3b82f6"];
const PATH_COLOR = "#d4c090";
const PATH_STROKE = "#b8a070";
const ENTRY_COLOR = "#e8d49a";
const BOARD_BG = "#1a1208";

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
  isMobile?: boolean;
}

// Arrow SVG paths by direction
function ArrowPath({ direction, cx, cy, size }: { direction: string; cx: number; cy: number; size: number }) {
  const h = size * 0.5;
  switch (direction) {
    case "up":
      return <polygon points={`${cx},${cy - h} ${cx - h},${cy + h} ${cx + h},${cy + h}`} fill="#ff2a6d" opacity={0.85} />;
    case "down":
      return <polygon points={`${cx},${cy + h} ${cx - h},${cy - h} ${cx + h},${cy - h}`} fill="#ff2a6d" opacity={0.85} />;
    case "left":
      return <polygon points={`${cx - h},${cy} ${cx + h},${cy - h} ${cx + h},${cy + h}`} fill="#ff2a6d" opacity={0.85} />;
    case "right":
      return <polygon points={`${cx + h},${cy} ${cx - h},${cy - h} ${cx - h},${cy + h}`} fill="#ff2a6d" opacity={0.85} />;
    default:
      return null;
  }
}

export function MapCanvas({ locations, players, reachable, onCellClick, isMobile = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Pan only on mobile, fixed on desktop
  useGesture(
    {
      onDrag: ({ delta: [dx, dy] }) => {
        if (!isMobile) return;
        setPan((p) => ({
          x: Math.min(0, Math.max(p.x + dx, -(SVG_W - (containerRef.current?.clientWidth ?? SVG_W)))),
          y: Math.min(0, Math.max(p.y + dy, -(SVG_H - (containerRef.current?.clientHeight ?? SVG_H)))),
        }));
      },
    },
    { target: containerRef, eventOptions: { passive: false } }
  );

  const reachableSet = new Set(reachable.map(([r, c]) => `${r},${c}`));

  // Build a slug → location map
  const slugToLoc = new Map<string, Location>();
  for (const loc of locations) slugToLoc.set(loc.slug, loc);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden touch-none select-none"
      style={{ background: BOARD_BG, cursor: isMobile ? "grab" : "default" }}
    >
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{
          transform: isMobile ? `translate(${pan.x}px, ${pan.y}px)` : undefined,
          display: "block",
          // Center on desktop
          margin: isMobile ? undefined : "auto",
        }}
      >
        {/* Background */}
        <rect width={SVG_W} height={SVG_H} fill={BOARD_BG} />

        {/* Board border */}
        <rect x={2} y={2} width={SVG_W - 4} height={SVG_H - 4} fill="none" stroke="#8B6914" strokeWidth={3} rx={4} />

        {/* ─── Room images (drawn first as background) ─── */}
        {Object.entries(ROOM_RECTS).map(([slug, [rs, re, cs, ce]]) => {
          const x = cs * CELL_PX;
          const y = rs * CELL_PX;
          const w = (ce - cs + 1) * CELL_PX;
          const h = (re - rs + 1) * CELL_PX;
          const loc = slugToLoc.get(slug);
          return (
            <g key={slug}>
              <rect x={x} y={y} width={w} height={h} fill="#2a1f0a" stroke="#8B6914" strokeWidth={1.5} />
              {loc?.imageUrl && (
                <image
                  href={loc.imageUrl}
                  x={x + 1} y={y + 1}
                  width={w - 2} height={h - 2}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {/* Room overlay with name */}
              <rect x={x} y={y + h - 20} width={w} height={20} fill="rgba(0,0,0,0.7)" />
              <text
                x={x + w / 2}
                y={y + h - 7}
                textAnchor="middle"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#fff"
              >
                {loc?.name ?? slug}
              </text>
            </g>
          );
        })}

        {/* ─── Path and entry cells ─── */}
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
                {/* Cell background */}
                <rect
                  x={x + 1} y={y + 1}
                  width={CELL_PX - 2} height={CELL_PX - 2}
                  rx={4} ry={4}
                  fill={isReachable ? "#5aecb8" : isEntry ? ENTRY_COLOR : PATH_COLOR}
                  stroke={isReachable ? "#00c88a" : PATH_STROKE}
                  strokeWidth={isReachable ? 2 : 1}
                />

                {/* Pulse ring for reachable */}
                {isReachable && (
                  <rect
                    x={x + 1} y={y + 1}
                    width={CELL_PX - 2} height={CELL_PX - 2}
                    rx={4} ry={4}
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth={1.5}
                    opacity={0.6}
                    className="animate-pulse"
                  />
                )}

                {/* Entry arrow */}
                {isEntry && (
                  <ArrowPath
                    direction={ENTRY_DIRECTION[code] ?? "up"}
                    cx={x + CELL_PX / 2}
                    cy={y + CELL_PX / 2}
                    size={10}
                  />
                )}
              </g>
            );
          })
        )}

        {/* ─── Player tokens ─── */}
        {players.map((p, idx) => {
          const cx = p.gridCol * CELL_PX + CELL_PX / 2;
          const cy = p.gridRow * CELL_PX + CELL_PX / 2;
          const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length];
          // Offset if multiple players on same cell
          const offset = (idx % 2 === 0 ? 1 : -1) * (Math.floor(idx / 2) * 5);

          return (
            <g key={p.id} transform={`translate(${offset}, ${offset})`}>
              {/* Glow ring for current player */}
              {p.isMe && (
                <circle cx={cx} cy={cy} r={13} fill="none" stroke={color} strokeWidth={2} opacity={0.5} className="animate-ping" />
              )}
              {/* Token circle */}
              <circle cx={cx} cy={cy} r={11} fill={color} stroke="#0a0a0c" strokeWidth={2} />
              {/* Player initial */}
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#000">
                {p.nickname.charAt(0).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
