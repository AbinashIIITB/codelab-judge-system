let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Ensure URL starts with http/https to prevent relative path issues
if (API_URL && !API_URL.startsWith('http')) {
    API_URL = `https://${API_URL}`;
}

interface FetchOptions extends RequestInit {
    params?: Record<string, string>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Remove any double slashes and ensure /api prefix
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    let url = `${baseUrl}/api${endpoint}`;

    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
}

// Problems API
export const problemsApi = {
    list: (params?: { search?: string; difficulty?: string; page?: string; limit?: string }) =>
        fetchApi<{
            problems: Array<{
                id: string;
                slug: string;
                title: string;
                difficulty: string;
                tags: string[];
            }>;
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        }>('/problems', { params }),

    get: (slug: string) =>
        fetchApi<{
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
        }>(`/problems/${slug}`),
};

// Submissions API
export const submissionsApi = {
    submit: (data: { problemSlug: string; code: string; language: string }) =>
        fetchApi<{ submissionId: string; status: string }>('/submissions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    run: (data: { problemSlug: string; code: string; language: string; customInput?: string }) =>
        fetchApi<{
            output: string;
            error?: string;
            runtime: number;
            memory: number;
            testResults?: Array<{
                input: string;
                expectedOutput: string;
                actualOutput: string;
                passed: boolean;
            }>;
        }>('/submissions/run', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    get: (id: string) =>
        fetchApi<{
            id: string;
            status: string;
            verdict?: string;
            runtime?: number;
            memory?: number;
            testCasesPassed: number;
            totalTestCases: number;
            error?: string;
        }>(`/submissions/${id}`),
};

// Leaderboard API
export const leaderboardApi = {
    global: (params?: { page?: string; limit?: string }) =>
        fetchApi<{
            leaderboard: Array<{
                rank: number;
                userId: string;
                problemsSolved: number;
                totalSubmissions: number;
                lastSolvedAt?: string;
            }>;
        }>('/leaderboard', { params }),

    problem: (slug: string, params?: { page?: string; limit?: string }) =>
        fetchApi<{
            problemSlug: string;
            leaderboard: Array<{
                rank: number;
                userId: string;
                runtime: number;
                memory: number;
                language: string;
                percentile: number;
            }>;
            totalParticipants: number;
        }>(`/leaderboard/${slug}`, { params }),

    daily: () =>
        fetchApi<{
            date: string;
            problem: {
                slug: string;
                title: string;
                difficulty: string;
                tags: string[];
            };
        }>('/leaderboard/daily/challenge'),
};
