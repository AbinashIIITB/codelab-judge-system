'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Resolve the WebSocket URL. Mirrors getApiBaseUrl(): an explicit
 * NEXT_PUBLIC_WS_URL (or NEXT_PUBLIC_API_URL) wins so hosted deployments work,
 * with the :4000-on-this-host guess only as a development fallback.
 */
function getWsUrl(): string {
    const configured = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL;
    if (configured) {
        return configured.replace(/\/$/, '');
    }

    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.hostname}:4000`;
    }

    return 'ws://localhost:4000';
}

export function getSocket(): Socket {
    if (!socket) {
        socket = io(getWsUrl(), {
            autoConnect: false,
            transports: ['websocket', 'polling'],
        });
    }
    return socket;
}

export function connectSocket(userId?: string): Socket {
    const sock = getSocket();

    if (!sock.connected) {
        sock.connect();

        if (userId) {
            sock.emit('join:user', userId);
        }
    }

    return sock;
}

export function disconnectSocket(): void {
    if (socket?.connected) {
        socket.disconnect();
    }
}

export interface SubmissionStatusUpdate {
    submissionId: string;
    status: 'pending' | 'queued' | 'compiling' | 'running' | 'completed';
    verdict?: string;
    testCasesPassed?: number;
    totalTestCases?: number;
    runtime?: number;
    memory?: number;
    error?: string;
}

export function onSubmissionStatus(
    callback: (update: SubmissionStatusUpdate) => void
): () => void {
    const sock = getSocket();

    sock.on('submission:status', callback);

    return () => {
        sock.off('submission:status', callback);
    };
}

/**
 * Follow a specific submission. The judge relays progress into a per-submission
 * room, so this is what delivers live verdicts without needing a signed-in user.
 */
export function joinSubmissionRoom(submissionId: string): void {
    getSocket().emit('join:submission', submissionId);
}

export function leaveSubmissionRoom(submissionId: string): void {
    getSocket().emit('leave:submission', submissionId);
}

export function joinProblemRoom(problemSlug: string): void {
    const sock = getSocket();
    sock.emit('join:problem', problemSlug);
}

export function leaveProblemRoom(problemSlug: string): void {
    const sock = getSocket();
    sock.emit('leave:problem', problemSlug);
}

export function joinLeaderboardRoom(): void {
    const sock = getSocket();
    sock.emit('join:leaderboard');
}
