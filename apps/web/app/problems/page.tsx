'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn, getDifficultyColor } from '@/lib/utils';
import { problemsApi } from '@/lib/api';

interface Problem {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    tags: string[];
    solved?: boolean;
}

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export default function ProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProblems();
    }, [search, difficulty, page]);

    async function fetchProblems() {
        try {
            setLoading(true);
            const params: Record<string, string> = {
                page: page.toString(),
                limit: '20',
            };
            if (search) params.search = search;
            if (difficulty !== 'All') params.difficulty = difficulty;

            const data = await problemsApi.list(params);
            setProblems(data.problems);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error('Failed to fetch problems:', error);
            // Use mock data for demo
            setProblems([
                { id: '1', slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', tags: ['array', 'hash-table'] },
                { id: '2', slug: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', tags: ['linked-list'] },
                { id: '3', slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', tags: ['string', 'stack'] },
                { id: '4', slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', tags: ['linked-list'] },
                { id: '5', slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Medium', tags: ['array', 'dp'] },
            ]);
        } finally {
            setLoading(false);
        }
    }

    const getDifficultyBadgeVariant = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Problems</h1>
                    <p className="text-muted-foreground">
                        Solve coding challenges and improve your skills
                    </p>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search problems..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        {/* Difficulty Filter */}
                        <div className="flex gap-2">
                            {difficulties.map((d) => (
                                <Button
                                    key={d}
                                    variant={difficulty === d ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDifficulty(d)}
                                >
                                    {d}
                                </Button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Problems Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Difficulty</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Tags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    // Loading skeleton
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-4 py-4">
                                                <div className="h-5 w-5 bg-muted rounded-full" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="h-4 w-48 bg-muted rounded" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="h-5 w-16 bg-muted rounded-full" />
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <div className="h-5 w-24 bg-muted rounded-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : problems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            No problems found
                                        </td>
                                    </tr>
                                ) : (
                                    problems.map((problem) => (
                                        <tr key={problem.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-4">
                                                {problem.solved ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/problems/${problem.slug}`}
                                                    className="font-medium hover:text-primary transition-colors"
                                                >
                                                    {problem.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={getDifficultyBadgeVariant(problem.difficulty)}>
                                                    {problem.difficulty}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {problem.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 p-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-3 text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
