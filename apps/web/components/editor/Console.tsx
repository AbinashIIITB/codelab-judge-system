'use client';

import { useRef, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ConsoleOutput {
    type: 'info' | 'success' | 'error' | 'output';
    message: string;
    timestamp: Date;
}

interface ConsoleProps {
    output: ConsoleOutput[];
    onClose: () => void;
    onClear?: () => void;
}

export function Console({ output, onClose, onClear }: ConsoleProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new output is added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output]);

    const getOutputColor = (type: ConsoleOutput['type']) => {
        switch (type) {
            case 'success':
                return 'text-green-500';
            case 'error':
                return 'text-red-500';
            case 'info':
                return 'text-muted-foreground';
            default:
                return 'text-foreground';
        }
    };

    return (
        <div className="h-full flex flex-col bg-muted/30">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
                <span className="text-sm font-medium">Console</span>
                <div className="flex items-center gap-1">
                    {onClear && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={onClear}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onClose}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Output */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-auto p-3 font-mono text-sm"
            >
                {output.length === 0 ? (
                    <p className="text-muted-foreground">
                        Run your code to see output here...
                    </p>
                ) : (
                    <div className="space-y-1">
                        {output.map((line, index) => (
                            <div key={index} className="flex">
                                <span className="text-muted-foreground/50 select-none mr-2 min-w-[60px] text-xs">
                                    {line.timestamp.toLocaleTimeString()}
                                </span>
                                <pre className={cn('whitespace-pre-wrap break-all', getOutputColor(line.type))}>
                                    {line.message}
                                </pre>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
