'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Clock, Database, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ProblemDescriptionProps {
    description: string;
    constraints: string[];
    sampleTestCases: Array<{
        input: string;
        expectedOutput: string;
    }>;
    timeLimit: number;
    memoryLimit: number;
    tags?: string[];
}

export function ProblemDescription({
    description,
    constraints,
    sampleTestCases,
    timeLimit,
    memoryLimit,
    tags,
}: ProblemDescriptionProps) {
    return (
        <div className="space-y-6">
            {/* Limits */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Time Limit: {timeLimit}ms</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Database className="h-4 w-4" />
                    <span>Memory Limit: {memoryLimit}MB</span>
                </div>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                    }}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {description}
                </ReactMarkdown>
            </div>

            {/* Constraints */}
            {constraints.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-2">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {constraints.map((constraint, index) => (
                            <li key={index}>{constraint}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Sample Test Cases */}
            {sampleTestCases.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-3">Sample Test Cases</h3>
                    <div className="space-y-4">
                        {sampleTestCases.map((testCase, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                                <div className="bg-muted/50 px-3 py-1.5 text-sm font-medium border-b">
                                    Example {index + 1}
                                </div>
                                <div className="grid md:grid-cols-2 divide-x divide-border">
                                    <div className="p-3">
                                        <div className="text-xs text-muted-foreground mb-1">Input</div>
                                        <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/30 p-2 rounded">
                                            {testCase.input}
                                        </pre>
                                    </div>
                                    <div className="p-3">
                                        <div className="text-xs text-muted-foreground mb-1">Output</div>
                                        <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/30 p-2 rounded">
                                            {testCase.expectedOutput}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
