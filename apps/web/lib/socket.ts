'use client';

import { io, Socket } from 'socket.io-client';

let WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

// Ensure URL starts with http/https or ws/wss to prevent relative path issues
if (WS_URL && !WS_URL.startsWith('http') && !WS_URL.startsWith('ws')) {
    WS_URL = `https://${WS_URL}`;
}

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        socket = io(WS_URL, {
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

export function joinSubmissionRoom(submissionId: string): void {
    const sock = getSocket();
    sock.emit('join:submission', submissionId);
}
