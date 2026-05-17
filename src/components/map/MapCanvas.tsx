"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  BOARD_GRID, BOARD_ROWS, BOARD_COLS, CELL_PX,
  ROOM_RECTS, ENTRY_CODE_TO_SLUG, isRoomCell, isEntryCell,
} from "@/lib/game/board";
import type { Location } from "@/types/game";

const PLAYER_COLORS = ["#f59e0b","#ef4444","#a855f7","#22c55e","#3b82f6","#ec4899"];
const PATH_COLOR   = "#191924";
const PATH_STROKE  = "#23233a";
const ENTRY_BG     = "#0d0d1c";
const BOARD_BG     = "#06060f";
const BOARD_BORDER = "#92400e";
const REACH_FILL   = "rgba(245,158,11,0.3)";
const REACH_STROKE = "#f59e0b";
const ARROW_COLOR  = "#f59e0b";

const SVG_W = BOARD_COLS * CELL_PX;
const SVG_H = BOARD_ROWS * CELL_PX;

interface PlayerDot {
  id: string; gridRow: number; gridCol: number;
  nickname: string; colorIndex: number; isMe: boolean;
}
interface Props {
  locations: Location[]; players: PlayerDot[];
  reachable: Array<[number, number]>; onCellClick?: (row: number, col: number) => void;
}

/** Seta aponta para dentro da sala com base em qual borda o entry toca */
function entryDir(row: number, col: number, slug: string): "up"|"down"|"left"|"right" {
  const rect = ROOM_RECTS[slug];
  if (!rect) return "up";
  const [rs, re, cs, ce] = rect;
  if (row > re)  return "up";
  if (row < rs)  return "down";
  if (col < cs)  return "right";
  if (col > ce)  return "left";
  const dRow = Math.abs(row - (rs+re)/2), dCol = Math.abs(col - (cs+ce)/2);
  if (dRow >= dCol) return row < (rs+re)/2 ? "down" : "up";
  return col < (cs+ce)/2 ? "right" : "left";
}

function Arrow({ dir, cx, cy, s }: { dir: string; cx: number; cy: number; s: number }) {
  const h = s*0.5;
  switch (dir) {
    case "up":    return <polygon points={`${cx},${cy-h} ${cx-h},${cy+h} ${cx+h},${cy+h}`} fill={ARROW_COLOR} />;
    case "down":  return <polygon points={`${cx},${cy+h} ${cx-h},${cy-h} ${cx+h},${cy-h}`} fill={ARROW_COLOR} />;
    case "left":  return <polygon points={`${cx-h},${cy} ${cx+h},${cy-h} ${cx+h},${cy+h}`} fill={ARROW_COLOR} />;
    case "right": return <polygon points={`${cx+h},${cy} ${cx-h},${cy-h} ${cx-h},${cy+h}`} fill={ARROW_COLOR} />;
    default: return null;
  }
}

const MIN_SCALE = 0.2, MAX_SCALE = 2.0, INITIAL_SCALE = 0.45;

export function MapCanvas({ locations, players, reachable, onCellClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panRef   = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(INITIAL_SCALE);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: INITIAL_SCALE });
  const dragging   = useRef(false);
  const dragMoved  = useRef(false);
  const dragStart  = useRef({ x: 0, y: 0, px: 0, py: 0 });

  // Center map on mount
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const x = (c.clientWidth  - SVG_W * INITIAL_SCALE) / 2;
    const y = (c.clientHeight - SVG_H * INITIAL_SCALE) / 2;
    panRef.current = { x, y };
    setTransform({ x, y, scale: INITIAL_SCALE });
  }, []);

  function applyTransform(x: number, y: number, scale: number) {
    panRef.current = { x, y };
    scaleRef.current = scale;
    setTransform({ x, y, scale });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true; dragMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, px: panRef.current.x, py: panRef.current.y };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x, dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved.current = true;
    applyTransform(dragStart.current.px + dx, dragStart.current.py + dy, scaleRef.current);
  }
  function onPointerUp() { dragging.current = false; }

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scaleRef.current * factor));
    const c = containerRef.current!;
    const rect = c.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const r = newScale / scaleRef.current;
    applyTransform(mx - r*(mx - panRef.current.x), my - r*(my - panRef.current.y), newScale);
  }, []);

  // Click on container — subtract pan and scale to get SVG cell
  function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragMoved.current) { dragMoved.current = false; return; }
    const c = containerRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const svgX = (e.clientX - rect.left - panRef.current.x) / scaleRef.current;
    const svgY = (e.clientY - rect.top  - panRef.current.y) / scaleRef.current;
    if (svgX < 0 || svgX >= SVG_W || svgY < 0 || svgY >= SVG_H) return;
    const col = Math.floor(svgX / CELL_PX), row = Math.floor(svgY / CELL_PX);
    if (col >= 0 && col < BOARD_COLS && row >= 0 && row < BOARD_ROWS) onCellClick?.(row, col);
  }

  const reachableSet = new Set(reachable.map(([r,c]) => `${r},${c}`));
  const slugToLoc    = new Map(locations.map(l => [l.slug, l]));

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden select-none"
      style={{ background: BOARD_BG, cursor: dragging.current ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}  onPointerLeave={onPointerUp}
      onWheel={onWheel} onClick={onContainerClick}
    >
      <svg
        width={SVG_W} height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{
          transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          display: "block", touchAction: "none",
          pointerEvents: "none",
        }}
      >
        <rect width={SVG_W} height={SVG_H} fill={BOARD_BG} />
        <rect x={3} y={3} width={SVG_W-6} height={SVG_H-6} fill="none" stroke={BOARD_BORDER} strokeWidth={5} rx={8} />

        {/* ── Room images ── */}
        {Object.entries(ROOM_RECTS).map(([slug, [rs, re, cs, ce]]) => {
          const x = cs*CELL_PX, y = rs*CELL_PX;
          const w = (ce-cs+1)*CELL_PX, h = (re-rs+1)*CELL_PX;
          const loc = slugToLoc.get(slug);
          return (
            <g key={slug}>
              <rect x={x} y={y} width={w} height={h} fill="#0a0f1a" stroke={BOARD_BORDER} strokeWidth={2} rx={4} />
              {loc?.imageUrl && (
                <image href={loc.imageUrl} x={x+2} y={y+2} width={w-4} height={h-4} preserveAspectRatio="xMidYMid slice" />
              )}
              <defs>
                <linearGradient id={`g-${slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="55%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.88)" />
                </linearGradient>
              </defs>
              <rect x={x} y={y} width={w} height={h} fill={`url(#g-${slug})`} rx={4} />
              <text x={x+w/2} y={y+h-12} textAnchor="middle"
                fontSize={Math.min(18, Math.max(12, w/6))}
                fontFamily="monospace" fontWeight="bold" fill="#fff">
                {loc?.name ?? slug}
              </text>
            </g>
          );
        })}

        {/* ── Paths and entries ── */}
        {BOARD_GRID.map((row, ri) =>
          row.map((code, ci) => {
            if (isRoomCell(code)) return null;
            const x = ci*CELL_PX, y = ri*CELL_PX;
            const key = `${ri},${ci}`;
            const isReachable = reachableSet.has(key);
            const isEntry = isEntryCell(code);
            return (
              <g key={key}>
                <rect x={x+1} y={y+1} width={CELL_PX-2} height={CELL_PX-2} rx={10}
                  fill={isReachable ? REACH_FILL : isEntry ? ENTRY_BG : PATH_COLOR}
                  stroke={isReachable ? REACH_STROKE : PATH_STROKE}
                  strokeWidth={isReachable ? 3 : 1}
                />
                {isEntry && (() => {
                  const slug = ENTRY_CODE_TO_SLUG[code];
                  return <Arrow dir={entryDir(ri, ci, slug)} cx={x+CELL_PX/2} cy={y+CELL_PX/2} s={CELL_PX*0.28} />;
                })()}
              </g>
            );
          })
        )}

        {/* ── Player tokens ── */}
        {players.map((p, idx) => {
          const cx = p.gridCol*CELL_PX + CELL_PX/2;
          const cy = p.gridRow*CELL_PX + CELL_PX/2;
          const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length];
          const offsets = [[0,0],[20,-12],[-20,-12],[0,20],[18,10],[-18,10]];
          const [ox,oy] = offsets[idx] ?? [0,0];
          const r = CELL_PX * 0.24;
          return (
            <g key={p.id} transform={`translate(${ox},${oy})`}>
              {p.isMe && (
                <circle cx={cx} cy={cy} r={r+8} fill="none" stroke={color} strokeWidth={3}>
                  <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r={r} fill={color} stroke={BOARD_BG} strokeWidth={4} />
              <text x={cx} y={cy+r*0.4} textAnchor="middle"
                fontSize={r*0.95} fontFamily="monospace" fontWeight="bold" fill="#000">
                {p.nickname.charAt(0).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
