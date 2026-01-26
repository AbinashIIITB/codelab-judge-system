// ==================== User Types ====================
export interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    solvedProblems: string[];
    totalSubmissions: number;
    acceptedSubmissions: number;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== Problem Types ====================
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface Problem {
    id: string;
    slug: string;
    title: string;
    difficulty: Difficulty;
    description: string;        // Markdown content
    constraints: string[];
    sampleTestCases: TestCase[];
    hiddenTestCases: TestCase[];
    timeLimit: number;          // in milliseconds
    memoryLimit: number;        // in MB
    tags: string[];
    starterCode: Record<Language, string>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProblemListItem {
    id: string;
    slug: string;
    title: string;
    difficulty: Difficulty;
    tags: string[];
    acceptanceRate: number;
    solved?: boolean;
}

// ==================== Submission Types ====================
export type Language = 'cpp' | 'python' | 'java' | 'javascript';

export type SubmissionStatus =
    | 'pending'
    | 'queued'
    | 'compiling'
    | 'running'
    | 'completed';

export type Verdict =
    | 'Accepted'
    | 'Wrong Answer'
    | 'Time Limit Exceeded'
    | 'Memory Limit Exceeded'
    | 'Runtime Error'
    | 'Compilation Error';

export interface TestCaseResult {
    passed: boolean;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
    runtime?: number;
    memory?: number;
    error?: string;
}

export interface Submission {
    id: string;
    userId: string;
    problemId: string;
    problemSlug: string;
    code: string;
    language: Language;
    status: SubmissionStatus;
    verdict?: Verdict;
    runtime?: number;           // in milliseconds
    memory?: number;            // in MB
    testCasesPassed: number;
    totalTestCases: number;
    testCaseResults?: TestCaseResult[];
    error?: string;
    createdAt: Date;
    completedAt?: Date;
}

// ==================== Leaderboard Types ====================
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    userImage?: string;
    problemsSolved: number;
    totalSubmissions: number;
    acceptanceRate: number;
    lastSolvedAt?: Date;
}

// ==================== API Request/Response Types ====================
export interface SubmitRequest {
    problemSlug: string;
    code: string;
    language: Language;
}

export interface RunCodeRequest {
    problemSlug: string;
    code: string;
    language: Language;
    customInput?: string;
}

export interface SubmitResponse {
    submissionId: string;
    status: SubmissionStatus;
}

export interface RunCodeResponse {
    output: string;
    error?: string;
    runtime: number;
    memory: number;
}

// ==================== WebSocket Event Types ====================
export interface SubmissionStatusUpdate {
    submissionId: string;
    status: SubmissionStatus;
    verdict?: Verdict;
    testCasesPassed?: number;
    totalTestCases?: number;
    runtime?: number;
    memory?: number;
    error?: string;
}
