"use client";

import { useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import type { Location, LocationConnection, Player, TransportType } from "@/types/game";

const TRANSPORT_COLORS: Record<TransportType, string> = {
  drone: "#00e5ff",
  hyperloop: "#ff2a6d",
  magrail: "#a855f7",
};

const TRANSPORT_DASH: Record<TransportType, string> = {
  drone: "none",
  hyperloop: "6 3",
  magrail: "2 4",
};

interface Props {
  locations: Location[];
  connections: LocationConnection[];
  players: Player[];
  myPlayerId: string | null;
  currentPlayerId: string | null;
  reachable: Array<{ locationId: string; transportType: TransportType }>;
  onLocationClick?: (locationId: string, transportType: TransportType) => void;
}

const WIDTH = 800;
const HEIGHT = 600;

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
      onDrag: ({ delta: [dx, dy] }) => {
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      },
      onPinch: ({ offset: [s] }) => {
        setScale(Math.min(Math.max(s, 0.4), 3));
      },
      onWheel: ({ delta: [, dy] }) => {
        setScale((s) => Math.min(Math.max(s - dy * 0.001, 0.4), 3));
      },
    },
    { target: svgRef, eventOptions: { passive: false } }
  );

  function locCoords(loc: Location) {
    return {
      x: parseFloat(loc.mapX) * WIDTH,
      y: parseFloat(loc.mapY) * HEIGHT,
    };
  }

  const reachableIds = new Set(reachable.map((r) => r.locationId));
  const isMyTurn = myPlayerId === currentPlayerId;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-sm border border-zinc-800 bg-zinc-950">
      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-sm p-2.5 backdrop-blur-sm">
        {(Object.entries(TRANSPORT_COLORS) as [TransportType, string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <svg width="20" height="8">
              <line
                x1="0" y1="4" x2="20" y2="4"
                stroke={color}
                strokeWidth="2"
                strokeDasharray={TRANSPORT_DASH[type]}
              />
            </svg>
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          {/* Connections */}
          {connections.map((conn) => {
            const from = locations.find((l) => l.id === conn.fromId);
            const to = locations.find((l) => l.id === conn.toId);
            if (!from || !to) return null;
            const fc = locCoords(from);
            const tc = locCoords(to);
            return (
              <line
                key={conn.id}
                x1={fc.x} y1={fc.y}
                x2={tc.x} y2={tc.y}
                stroke={TRANSPORT_COLORS[conn.transportType]}
                strokeWidth={1.5}
                strokeDasharray={TRANSPORT_DASH[conn.transportType]}
                opacity={0.5}
              />
            );
          })}

          {/* Location nodes */}
          {locations.map((loc) => {
            const { x, y } = locCoords(loc);
            const isReachable = reachableIds.has(loc.id);
            const reachableEntry = reachable.find((r) => r.locationId === loc.id);
            const playersHere = players.filter((p) => p.currentLocationId === loc.id);
            const isHub = loc.isStartHub;

            return (
              <g
                key={loc.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => {
                  if (isReachable && isMyTurn && reachableEntry && onLocationClick) {
                    onLocationClick(loc.id, reachableEntry.transportType);
                  }
                }}
                className={isReachable && isMyTurn ? "cursor-pointer" : "cursor-default"}
              >
                {/* Reachable pulse ring */}
                {isReachable && isMyTurn && (
                  <circle
                    r={22}
                    fill="none"
                    stroke={TRANSPORT_COLORS[reachableEntry!.transportType]}
                    strokeWidth={1.5}
                    opacity={0.5}
                    className="animate-ping"
                  />
                )}

                {/* Node circle */}
                <circle
                  r={14}
                  fill={isHub ? "#27272a" : "#18181b"}
                  stroke={
                    isReachable && isMyTurn
                      ? TRANSPORT_COLORS[reachableEntry!.transportType]
                      : isHub
                        ? "#00e5ff"
                        : "#3f3f46"
                  }
                  strokeWidth={isHub ? 2 : 1.5}
                />

                {/* Location name */}
                <text
                  y={26}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#a1a1aa"
                  fontFamily="monospace"
                >
                  {loc.name.slice(0, 14)}
                </text>

                {/* Player avatars at location */}
                {playersHere.map((p, i) => (
                  <circle
                    key={p.id}
                    cx={-8 + i * 10}
                    cy={-2}
                    r={5}
                    fill={p.id === myPlayerId ? "#00e5ff" : "#ff2a6d"}
                    stroke="#0a0a0c"
                    strokeWidth={1}
                  />
                ))}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
