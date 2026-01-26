'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Play, Send, Loader2, ChevronDown, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProblemDescription } from '@/components/problems/ProblemDescription';
import { Console } from '@/components/editor/Console';
import { problemsApi, submissionsApi } from '@/lib/api';
import { connectSocket, onSubmissionStatus, SubmissionStatusUpdate } from '@/lib/socket';
import { cn, getDifficultyColor } from '@/lib/utils';
import { LANGUAGE_CONFIG, STARTER_CODE, Language } from '@codelab/shared';

// Dynamic import for Monaco Editor (client-side only)
const CodeEditor = dynamic(
    () => import('@/components/editor/CodeEditor').then(mod => mod.CodeEditor),
    { ssr: false, loading: () => <div className="h-full bg-muted animate-pulse" /> }
);

interface Problem {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    description: string;
    constraints: string[];
    sampleTestCases: Array<{
        input: string;
        expectedOutput: string;
    }>;
    timeLimit: number;
    memoryLimit: number;
    tags: string[];
    starterCode: Record<string, string>;
}

interface ConsoleOutput {
    type: 'info' | 'success' | 'error' | 'output';
    message: string;
    timestamp: Date;
}

const languages: { value: Language; label: string }[] = [
    { value: 'cpp', label: 'C++' },
    { value: 'python', label: 'Python 3' },
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
];

export default function ProblemPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<Language>('cpp');
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
    const [showConsole, setShowConsole] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);

    // Fetch problem data
    useEffect(() => {
        async function fetchProblem() {
            try {
                setLoading(true);
                const data = await problemsApi.get(slug);
                setProblem(data);
                setCode(data.starterCode?.[language] || STARTER_CODE[language]);
            } catch (error) {
                console.error('Failed to fetch problem:', error);
                // Mock data for demo
                setProblem({
                    id: '1',
                    slug: slug,
                    title: 'Two Sum',
                    difficulty: 'Easy',
                    description: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

## Example 1:

\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Example 2:

\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\``,
                    constraints: [
                        '2 <= nums.length <= 10^4',
                        '-10^9 <= nums[i] <= 10^9',
                        'Only one valid answer exists.',
                    ],
                    sampleTestCases: [
                        { input: '4\n2 7 11 15\n9', expectedOutput: '0 1' },
                        { input: '3\n3 2 4\n6', expectedOutput: '1 2' },
                    ],
                    timeLimit: 2000,
                    memoryLimit: 256,
                    tags: ['array', 'hash-table'],
                    starterCode: STARTER_CODE,
                });
                setCode(STARTER_CODE[language]);
            } finally {
                setLoading(false);
            }
        }

        fetchProblem();
    }, [slug]);

    // Update code when language changes
    useEffect(() => {
        if (problem?.starterCode?.[language]) {
            setCode(problem.starterCode[language]);
        } else {
            setCode(STARTER_CODE[language]);
        }
    }, [language, problem]);

    // Set up WebSocket connection
    useEffect(() => {
        const socket = connectSocket();

        const unsubscribe = onSubmissionStatus((update: SubmissionStatusUpdate) => {
            if (update.submissionId === submissionId) {
                handleStatusUpdate(update);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [submissionId]);

    const handleStatusUpdate = useCallback((update: SubmissionStatusUpdate) => {
        const timestamp = new Date();

        switch (update.status) {
            case 'queued':
                addConsoleOutput('info', 'Submission queued...', timestamp);
                break;
            case 'compiling':
                addConsoleOutput('info', 'Compiling code...', timestamp);
                break;
            case 'running':
                addConsoleOutput('info', `Running test cases (${update.testCasesPassed || 0}/${update.totalTestCases || '?'})...`, timestamp);
                break;
            case 'completed':
                setIsSubmitting(false);
                if (update.verdict === 'Accepted') {
                    addConsoleOutput('success', `✓ Accepted! Runtime: ${update.runtime}ms, Memory: ${update.memory}MB`, timestamp);
                } else {
                    addConsoleOutput('error', `✗ ${update.verdict}${update.error ? `: ${update.error}` : ''}`, timestamp);
                }
                break;
        }
    }, []);

    const addConsoleOutput = (type: ConsoleOutput['type'], message: string, timestamp = new Date()) => {
        setConsoleOutput(prev => [...prev, { type, message, timestamp }]);
        setShowConsole(true);
    };

    const handleRun = async () => {
        if (!problem) return;

        setIsRunning(true);
        setConsoleOutput([]);
        setShowConsole(true);
        addConsoleOutput('info', 'Running code against sample test cases...');

        try {
            const result = await submissionsApi.run({
                problemSlug: problem.slug,
                code,
                language,
            });

            if (result.error) {
                addConsoleOutput('error', result.error);
            } else if (result.testResults) {
                result.testResults.forEach((test, i) => {
                    if (test.passed) {
                        addConsoleOutput('success', `Test ${i + 1}: Passed ✓`);
                    } else {
                        addConsoleOutput('error', `Test ${i + 1}: Failed ✗`);
                        addConsoleOutput('output', `  Input: ${test.input}`);
                        addConsoleOutput('output', `  Expected: ${test.expectedOutput}`);
                        addConsoleOutput('output', `  Got: ${test.actualOutput}`);
                    }
                });
            } else {
                addConsoleOutput('output', result.output);
            }

            addConsoleOutput('info', `Runtime: ${result.runtime}ms | Memory: ${result.memory}MB`);
        } catch (error) {
            addConsoleOutput('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!problem) return;

        setIsSubmitting(true);
        setConsoleOutput([]);
        setShowConsole(true);
        addConsoleOutput('info', 'Submitting solution...');

        try {
            const result = await submissionsApi.submit({
                problemSlug: problem.slug,
                code,
                language,
            });

            setSubmissionId(result.submissionId);
            addConsoleOutput('info', `Submission ID: ${result.submissionId}`);
        } catch (error) {
            addConsoleOutput('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    const getDifficultyBadgeVariant = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'destructive';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <p className="text-muted-foreground">Problem not found</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                    <h1 className="font-semibold">{problem.title}</h1>
                    <Badge variant={getDifficultyBadgeVariant(problem.difficulty)}>
                        {problem.difficulty}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="appearance-none bg-background border border-input rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {languages.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                    >
                        {isRunning ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4 mr-1" />
                        )}
                        Run
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isRunning || isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4 mr-1" />
                        )}
                        Submit
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    {/* Problem Description Panel */}
                    <Panel defaultSize={40} minSize={25}>
                        <div className="h-full overflow-auto p-4">
                            <ProblemDescription
                                description={problem.description}
                                constraints={problem.constraints}
                                sampleTestCases={problem.sampleTestCases}
                                timeLimit={problem.timeLimit}
                                memoryLimit={problem.memoryLimit}
                            />
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

                    {/* Code Editor Panel */}
                    <Panel defaultSize={60} minSize={30}>
                        <PanelGroup direction="vertical">
                            {/* Editor */}
                            <Panel defaultSize={showConsole ? 70 : 100} minSize={30}>
                                <CodeEditor
                                    value={code}
                                    onChange={setCode}
                                    language={LANGUAGE_CONFIG[language].monacoLanguage}
                                />
                            </Panel>

                            {/* Console */}
                            {showConsole && (
                                <>
                                    <PanelResizeHandle className="h-1 bg-border hover:bg-primary/50 transition-colors" />
                                    <Panel defaultSize={30} minSize={15}>
                                        <Console
                                            output={consoleOutput}
                                            onClose={() => setShowConsole(false)}
                                        />
                                    </Panel>
                                </>
                            )}

                            {/* Console Toggle */}
                            {!showConsole && (
                                <div className="border-t p-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowConsole(true)}
                                        className="w-full justify-start"
                                    >
                                        <Terminal className="h-4 w-4 mr-2" />
                                        Console
                                    </Button>
                                </div>
                            )}
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}
