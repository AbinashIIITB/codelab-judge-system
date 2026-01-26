import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500/10 text-green-500',
        warning: 'border-transparent bg-yellow-500/10 text-yellow-500',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };
