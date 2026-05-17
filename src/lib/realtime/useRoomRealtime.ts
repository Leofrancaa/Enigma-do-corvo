"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { roomBroadcastChannel, roomPresenceChannel, roomStateChannel } from "./channels";
import type { GameEvent } from "@/types/game";

interface UseRoomRealtimeOptions {
  roomId: string;
  sessionId: string;
  playerId: string | null;
  onEvent?: (event: GameEvent) => void;
  onPresenceChange?: (online: string[]) => void;
  onSnapshotNeeded?: () => void;
}

export function useRoomRealtime({
  roomId,
  sessionId,
  playerId,
  onEvent,
  onPresenceChange,
  onSnapshotNeeded,
}: UseRoomRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const connect = useCallback(() => {
    const supabase = getSupabaseBrowserClient();

    // State channel — postgres_changes
    const stateChannel = supabase
      .channel(roomStateChannel(roomId))
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, () => {
        onSnapshotNeeded?.();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, () => {
        onSnapshotNeeded?.();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "discovered_clues", filter: `room_id=eq.${roomId}` }, () => {
        onSnapshotNeeded?.();
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          retryCountRef.current = 0;
        }
        if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          scheduleReconnect();
        }
      });

    channelRef.current = stateChannel;

    // Broadcast channel — ephemeral events
    supabase
      .channel(roomBroadcastChannel(roomId))
      .on("broadcast", { event: "game_event" }, (msg: { payload: unknown }) => {
        onEvent?.(msg.payload as GameEvent);
      })
      .subscribe();

    // Presence channel
    const presenceChannel = supabase
      .channel(roomPresenceChannel(roomId))
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState() as Record<string, { sessionId: string }[]>;
        const online = Object.values(state)
          .flat()
          .map((p) => p.sessionId);
        onPresenceChange?.(online);
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED" && playerId) {
          await presenceChannel.track({ sessionId, playerId });
        }
      });

    presenceChannelRef.current = presenceChannel;
  }, [roomId, sessionId, playerId, onEvent, onPresenceChange, onSnapshotNeeded]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000);
    retryCountRef.current++;
    reconnectTimeoutRef.current = setTimeout(() => {
      disconnect();
      connect();
      onSnapshotNeeded?.();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    const supabase = getSupabaseBrowserClient();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      disconnect();
    };
  }, [connect, disconnect]);
}
