"use client";

import { useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import type { Location, LocationConnection } from "@/types/game";

// Posições fixas dos 7 locais no tabuleiro (viewBox 1000x650)
const NODE_POSITIONS: Record<string, { cx: number; cy: number }> = {
  "observatorio-zenite":  { cx: 500, cy: 70  },
  "torre-dados":          { cx: 185, cy: 235 },
  "terminal-subterraneo": { cx: 500, cy: 310 },
  "catedral-codigo":      { cx: 815, cy: 235 },
  "mercado-neon":         { cx: 150, cy: 470 },
  "docas-silicio":        { cx: 850, cy: 470 },
  "beco-cifras":          { cx: 500, cy: 560 },
};

const CARD_W = 140;
const CARD_H = 95;

interface Props {
  locations: Location[];
  connections: LocationConnection[];
  players: Array<{ id: string; currentLocationId: string | null; nickname: string; character?: { avatarUrl?: string | null } | null }>;
  myPlayerId: string | null;
  currentPlayerId: string | null;
  reachable: string[];
  onLocationClick?: (locationId: string) => void;
}

export function MapCanvas({
  locations,
  connections,
  players,
  myPlayerId,
  currentPlayerId,
  reachable,
  onLocationClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useGesture(
    {
      onDrag: ({ delta: [dx, dy] }) => setPan((p) => ({ x: p.x + dx, y: p.y + dy })),
      onPinch: ({ offset: [s] }) => setScale(Math.min(Math.max(s, 0.4), 2.5)),
      onWheel: ({ delta: [, dy] }) => setScale((s) => Math.min(Math.max(s - dy * 0.001, 0.4), 2.5)),
    },
    { target: svgRef, eventOptions: { passive: false } }
  );

  function getPos(loc: Location) {
    return NODE_POSITIONS[loc.slug] ?? {
      cx: parseFloat(loc.mapX) * 1000,
      cy: parseFloat(loc.mapY) * 650,
    };
  }

  const isMyTurn = myPlayerId === currentPlayerId;

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950 rounded-sm border border-zinc-800">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 650"
        className="w-full h-full touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,229,255,0.05)" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          <rect width="1000" height="650" fill="url(#grid)" />

          {/* Connections */}
          {connections.map((conn) => {
            const from = locations.find((l) => l.id === conn.fromId);
            const to = locations.find((l) => l.id === conn.toId);
            if (!from || !to) return null;
            const fp = getPos(from);
            const tp = getPos(to);
            return (
              <line
                key={conn.id}
                x1={fp.cx} y1={fp.cy}
                x2={tp.cx} y2={tp.cy}
                stroke="rgba(0,229,255,0.15)"
                strokeWidth={3}
                strokeDasharray="8 5"
              />
            );
          })}

          {/* Location nodes */}
          {locations.map((loc) => {
            const { cx, cy } = getPos(loc);
            const x = cx - CARD_W / 2;
            const y = cy - CARD_H / 2;
            const isReachable = reachable.includes(loc.id);
            const playersHere = players.filter((p) => p.currentLocationId === loc.id);

            return (
              <g
                key={loc.id}
                onClick={() => isReachable && isMyTurn && onLocationClick?.(loc.id)}
                style={{ cursor: isReachable && isMyTurn ? "pointer" : "default" }}
              >
                {/* Pulse ring when reachable */}
                {isReachable && isMyTurn && (
                  <rect
                    x={x - 4} y={y - 4}
                    width={CARD_W + 8} height={CARD_H + 8}
                    rx={6} ry={6}
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth={2}
                    opacity={0.6}
                    className="animate-pulse"
                  />
                )}

                {/* Card background */}
                <rect
                  x={x} y={y}
                  width={CARD_W} height={CARD_H}
                  rx={4} ry={4}
                  fill={isReachable && isMyTurn ? "rgba(0,229,255,0.08)" : "#18181b"}
                  stroke={isReachable && isMyTurn ? "#00e5ff" : "#3f3f46"}
                  strokeWidth={isReachable && isMyTurn ? 1.5 : 1}
                />

                {/* Location image */}
                {loc.imageUrl && (
                  <image
                    href={loc.imageUrl}
                    x={x + 2} y={y + 2}
                    width={CARD_W - 4} height={CARD_H - 28}
                    preserveAspectRatio="xMidYMid slice"
                    style={{ borderRadius: 3 }}
                  />
                )}

                {/* Image overlay gradient */}
                <rect
                  x={x + 2} y={y + CARD_H - 42}
                  width={CARD_W - 4} height={40}
                  rx={2} ry={2}
                  fill="url(#cardGrad)"
                />

                {/* Location name */}
                <text
                  x={cx}
                  y={y + CARD_H - 10}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="monospace"
                  fill={isReachable && isMyTurn ? "#00e5ff" : "#a1a1aa"}
                  fontWeight={isReachable && isMyTurn ? "bold" : "normal"}
                >
                  {loc.name.length > 18 ? loc.name.slice(0, 17) + "…" : loc.name}
                </text>

                {/* Player dots */}
                {playersHere.map((p, i) => (
                  <circle
                    key={p.id}
                    cx={x + 14 + i * 16}
                    cy={y + CARD_H - 24}
                    r={6}
                    fill={p.id === myPlayerId ? "#00e5ff" : "#ff2a6d"}
                    stroke="#0a0a0c"
                    strokeWidth={1.5}
                  />
                ))}
              </g>
            );
          })}

          {/* Gradient defs */}
          <defs>
            <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" stopOpacity="0" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </g>
      </svg>

      {/* Zoom hint */}
      <div className="absolute bottom-2 right-2 text-xs font-mono text-zinc-700">
        Arraste para mover • Scroll para zoom
      </div>
    </div>
  );
}
