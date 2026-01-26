import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatRuntime(ms: number): string {
    if (ms < 1000) {
        return `${ms} ms`;
    }
    return `${(ms / 1000).toFixed(2)} s`;
}

export function formatMemory(mb: number): string {
    if (mb < 1) {
        return `${(mb * 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
}

export function getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'text-green-500';
        case 'medium':
            return 'text-yellow-500';
        case 'hard':
            return 'text-red-500';
        default:
            return 'text-muted-foreground';
    }
}

export function getVerdictColor(verdict: string): string {
    switch (verdict) {
        case 'Accepted':
            return 'text-green-500';
        case 'Wrong Answer':
            return 'text-red-500';
        case 'Time Limit Exceeded':
            return 'text-yellow-500';
        case 'Memory Limit Exceeded':
            return 'text-orange-500';
        case 'Runtime Error':
        case 'Compilation Error':
            return 'text-red-500';
        default:
            return 'text-muted-foreground';
    }
}
