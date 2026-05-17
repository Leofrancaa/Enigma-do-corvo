export const roomStateChannel = (roomId: string) => `room:${roomId}:state`;
export const roomBroadcastChannel = (roomId: string) => `room:${roomId}:bcast`;
export const roomPresenceChannel = (roomId: string) => `room:${roomId}:presence`;
