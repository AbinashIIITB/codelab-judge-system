'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProblemDescription } from '@/components/problems/ProblemDescription';
import { Console } from '@/components/editor/Console';
import { problemsApi, submissionsApi } from '@/lib/api';
import { connectSocket, onSubmissionStatus, SubmissionStatusUpdate } from '@/lib/socket';
import { LANGUAGE_CONFIG, STARTER_CODE, Language } from '@codelab/shared';

// Dynamic import for Monaco Editor (client-side only)
const CodeEditor = dynamic(
    () => import('@/components/editor/CodeEditor').then(mod => mod.CodeEditor),
    { ssr: false, loading: () => <div className="h-[500px] bg-white border border-[#CCCCCC] flex items-center justify-center">Loading Editor...</div> }
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

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="container mx-auto py-8 text-center text-red-500">
                Problem not found
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 font-verdana text-[13px] text-[#333333]">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Content Column (Statement + Editor) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Problem Title & Headers */}
                    <div className="border-b border-[#CCCCCC] pb-4">
                        <h1 className="text-2xl font-bold text-[#333333] mb-2">
                            {problem.id}. {problem.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>time limit per test: {problem.timeLimit / 1000} seconds</span>
                            <span>memory limit per test: {problem.memoryLimit} megabytes</span>
                            <span>input: standard input</span>
                            <span>output: standard output</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white">
                        <ProblemDescription
                            description={problem.description}
                            constraints={problem.constraints}
                            sampleTestCases={problem.sampleTestCases}
                            timeLimit={problem.timeLimit}
                            memoryLimit={problem.memoryLimit}
                        />
                    </div>

                    {/* Editor Section */}
                    <div className="border border-[#CCCCCC] p-1 bg-[#E1E1E1]">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between p-2 bg-[#F0F0F0] border-b border-[#CCCCCC] mb-1">
                            <div className="flex items-center gap-2">
                                <label className="font-bold text-xs">Language:</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as Language)}
                                    className="border border-[#CCCCCC] px-2 py-0.5 text-xs"
                                >
                                    {languages.map((lang) => (
                                        <option key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRun}
                                    disabled={isRunning || isSubmitting}
                                    className="px-3 py-1 bg-white border border-[#CCCCCC] text-xs font-bold hover:bg-[#E0E0E0]"
                                >
                                    Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning || isSubmitting}
                                    className="px-3 py-1 bg-[#DDDDDD] border border-[#CCCCCC] text-xs font-bold hover:bg-[#CCCCCC]"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>

                        {/* Editor */}
                        <CodeEditor
                            value={code}
                            onChange={setCode}
                            language={LANGUAGE_CONFIG[language].monacoLanguage}
                        />

                        {/* Console */}
                        {showConsole && (
                            <div className="mt-2 border-t border-[#CCCCCC] bg-white p-2">
                                <div className="flex justify-between items-center mb-2 border-b border-[#EEEEEE] pb-1">
                                    <span className="font-bold text-xs text-gray-500">Output</span>
                                    <button onClick={() => setShowConsole(false)} className="text-xs text-blue-600 hover:underline">Close</button>
                                </div>
                                <div className="h-32 overflow-y-auto font-mono text-xs">
                                    {consoleOutput.map((out, idx) => (
                                        <div key={idx} className={
                                            out.type === 'error' ? 'text-red-600' :
                                                out.type === 'success' ? 'text-green-600' :
                                                    'text-black'
                                        }>
                                            {out.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Info/Submit Box */}
                    <div className="border border-[#CCCCCC] p-4 bg-white">
                        <h3 className="font-bold border-b border-[#CCCCCC] pb-2 mb-2 text-[#0056b3]">Problem Info</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Difficulty:</span>
                                <span className="font-bold">{problem.difficulty}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">ID:</span>
                                <span>{problem.id}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#CCCCCC]">
                            <button className="w-full bg-[#E1E1E1] border border-[#CCCCCC] py-1 text-xs hover:bg-[#D1D1D1] mb-2" onClick={() => {
                                document.querySelector('.monaco-editor')?.scrollIntoView({ behavior: 'smooth' });
                            }}>
                                Submit?
                            </button>
                        </div>
                    </div>

                    {/* Tags Box */}
                    <div className="border border-[#CCCCCC] p-4 bg-white">
                        <h3 className="font-bold border-b border-[#CCCCCC] pb-2 mb-2 text-[#0056b3]">Tags</h3>
                        <div className="flex flex-wrap gap-1">
                            {problem.tags.map(tag => (
                                <span key={tag} className="text-xs bg-[#F0F0F0] border border-[#EEEEEE] px-1 text-gray-600">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
