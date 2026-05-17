"use client";

import { useRef, useState, useCallback } from "react";
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
const PATH_COLOR    = "#1a1a24";
const PATH_STROKE   = "#262636";
const ENTRY_BG      = "#0f0f1a";
const BOARD_BG      = "#080810";
const BOARD_BORDER  = "#78350f";
const REACH_FILL    = "rgba(245,158,11,0.25)";
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
}

interface Props {
  locations: Location[];
  players: PlayerDot[];
  reachable: Array<[number, number]>;
  onCellClick?: (row: number, col: number) => void;
}

/** Direção da seta baseada em qual borda da sala o entry toca */
function entryDir(row: number, col: number, slug: string): "up" | "down" | "left" | "right" {
  const rect = ROOM_RECTS[slug];
  if (!rect) return "up";
  const [rs, re, cs, ce] = rect;
  if (row > re) return "up";
  if (row < rs) return "down";
  if (col < cs) return "right";
  if (col > ce) return "left";
  // fallback: posição relativa ao centro
  const dRow = Math.abs(row - (rs + re) / 2);
  const dCol = Math.abs(col - (cs + ce) / 2);
  if (dRow >= dCol) return row < (rs + re) / 2 ? "down" : "up";
  return col < (cs + ce) / 2 ? "right" : "left";
}

function Arrow({ dir, cx, cy, s }: { dir: string; cx: number; cy: number; s: number }) {
  const h = s * 0.5;
  switch (dir) {
    case "up":    return <polygon points={`${cx},${cy-h} ${cx-h},${cy+h} ${cx+h},${cy+h}`} fill={ARROW_COLOR} />;
    case "down":  return <polygon points={`${cx},${cy+h} ${cx-h},${cy-h} ${cx+h},${cy-h}`} fill={ARROW_COLOR} />;
    case "left":  return <polygon points={`${cx-h},${cy} ${cx+h},${cy-h} ${cx+h},${cy+h}`} fill={ARROW_COLOR} />;
    case "right": return <polygon points={`${cx+h},${cy} ${cx-h},${cy-h} ${cx-h},${cy+h}`} fill={ARROW_COLOR} />;
    default:      return null;
  }
}

export function MapCanvas({ locations, players, reachable, onCellClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const didDrag = useRef(false);

  const maxPanX = 0;
  const maxPanY = 0;
  const clampPan = useCallback((x: number, y: number) => {
    const cw = containerRef.current?.clientWidth ?? SVG_W;
    const ch = containerRef.current?.clientHeight ?? SVG_H;
    return {
      x: Math.min(0, Math.max(x, cw - SVG_W)),
      y: Math.min(0, Math.max(y, ch - SVG_H)),
    };
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    didDrag.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
    setPan(clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy));
  }
  function onPointerUp() { dragging.current = false; }

  // Convert screen click → SVG cell (accounting for pan)
  function onSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (didDrag.current) { didDrag.current = false; return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;
    const col = Math.floor(svgX / CELL_PX);
    const row = Math.floor(svgY / CELL_PX);
    onCellClick?.(row, col);
  }

  const reachableSet = new Set(reachable.map(([r, c]) => `${r},${c}`));
  const slugToLoc = new Map(locations.map(l => [l.slug, l]));

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden select-none"
      style={{ background: BOARD_BG, cursor: dragging.current ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, display: "block", touchAction: "none" }}
        onClick={onSvgClick}
      >
        <rect width={SVG_W} height={SVG_H} fill={BOARD_BG} />
        <rect x={2} y={2} width={SVG_W-4} height={SVG_H-4} fill="none" stroke={BOARD_BORDER} strokeWidth={3} rx={6} />

        {/* ── Imagens das salas ── */}
        {Object.entries(ROOM_RECTS).map(([slug, [rs, re, cs, ce]]) => {
          const x = cs * CELL_PX, y = rs * CELL_PX;
          const w = (ce - cs + 1) * CELL_PX, h = (re - rs + 1) * CELL_PX;
          const loc = slugToLoc.get(slug);
          return (
            <g key={slug}>
              <rect x={x} y={y} width={w} height={h} fill="#0d1117" stroke={BOARD_BORDER} strokeWidth={1.5} rx={3} />
              {loc?.imageUrl && (
                <image href={loc.imageUrl} x={x+1} y={y+1} width={w-2} height={h-2} preserveAspectRatio="xMidYMid slice" />
              )}
              <defs>
                <linearGradient id={`gl-${slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="50%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
                </linearGradient>
              </defs>
              <rect x={x} y={y} width={w} height={h} fill={`url(#gl-${slug})`} rx={3} />
              <text x={x+w/2} y={y+h-8} textAnchor="middle"
                fontSize={Math.min(12, Math.max(9, w/7))}
                fontFamily="monospace" fontWeight="bold" fill="#fff">
                {loc?.name ?? slug}
              </text>
            </g>
          );
        })}

        {/* ── Caminhos e entradas ── */}
        {BOARD_GRID.map((row, ri) =>
          row.map((code, ci) => {
            if (isRoomCell(code)) return null;
            const x = ci * CELL_PX, y = ri * CELL_PX;
            const key = `${ri},${ci}`;
            const isReachable = reachableSet.has(key);
            const isEntry = isEntryCell(code);
            return (
              <g key={key}>
                <rect
                  x={x+1} y={y+1} width={CELL_PX-2} height={CELL_PX-2} rx={6}
                  fill={isReachable ? REACH_FILL : isEntry ? ENTRY_BG : PATH_COLOR}
                  stroke={isReachable ? REACH_STROKE : PATH_STROKE}
                  strokeWidth={isReachable ? 2 : 1}
                  style={{ cursor: isReachable ? "pointer" : "default" }}
                />
                {isEntry && (() => {
                  const slug = ENTRY_CODE_TO_SLUG[code];
                  return <Arrow dir={entryDir(ri, ci, slug)} cx={x+CELL_PX/2} cy={y+CELL_PX/2} s={CELL_PX*0.3} />;
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
          const offsets = [[0,0],[8,-6],[-8,-6],[0,8],[8,4],[-8,4]];
          const [ox, oy] = offsets[idx] ?? [0, 0];
          return (
            <g key={p.id} transform={`translate(${ox},${oy})`}>
              {p.isMe && (
                <circle cx={cx} cy={cy} r={17} fill="none" stroke={color} strokeWidth={2.5}>
                  <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r={14} fill={color} stroke={BOARD_BG} strokeWidth={3} />
              <text x={cx} y={cy+5} textAnchor="middle" fontSize="12"
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
