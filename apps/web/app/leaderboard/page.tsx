'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { leaderboardApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    problemsSolved: number;
    totalSubmissions: number;
    lastSolvedAt?: string;
}

interface DailyChallenge {
    date: string;
    problem: {
        slug: string;
        title: string;
        difficulty: string;
        tags: string[];
    };
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, [page]);

    async function fetchData() {
        try {
            setLoading(true);
            const [leaderboardData, dailyData] = await Promise.all([
                leaderboardApi.global({ page: page.toString(), limit: '50' }),
                leaderboardApi.daily(),
            ]);
            setLeaderboard(leaderboardData.leaderboard);
            setDailyChallenge(dailyData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            // Mock data for demo
            setLeaderboard([
                { rank: 1, userId: 'alice_coder', problemsSolved: 342, totalSubmissions: 1250, lastSolvedAt: new Date().toISOString() },
                { rank: 2, userId: 'bob_dev', problemsSolved: 298, totalSubmissions: 980, lastSolvedAt: new Date().toISOString() },
                { rank: 3, userId: 'charlie_hacker', problemsSolved: 275, totalSubmissions: 890, lastSolvedAt: new Date().toISOString() },
                { rank: 4, userId: 'diana_code', problemsSolved: 250, totalSubmissions: 820, lastSolvedAt: new Date().toISOString() },
                { rank: 5, userId: 'evan_algo', problemsSolved: 235, totalSubmissions: 750, lastSolvedAt: new Date().toISOString() },
            ]);
            setDailyChallenge({
                date: new Date().toISOString().split('T')[0],
                problem: {
                    slug: 'two-sum',
                    title: 'Two Sum',
                    difficulty: 'Easy',
                    tags: ['array', 'hash-table'],
                },
            });
        } finally {
            setLoading(false);
        }
    }

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="text-muted-foreground font-mono">#{rank}</span>;
        }
    };

    const getRankBackground = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-500/10 border-yellow-500/20';
            case 2:
                return 'bg-gray-500/10 border-gray-500/20';
            case 3:
                return 'bg-amber-500/10 border-amber-500/20';
            default:
                return '';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Leaderboard */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-primary" />
                                Global Leaderboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                                            <div className="h-8 w-8 bg-muted rounded-full" />
                                            <div className="flex-1">
                                                <div className="h-4 w-32 bg-muted rounded" />
                                            </div>
                                            <div className="h-4 w-16 bg-muted rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {leaderboard.map((entry) => (
                                        <div
                                            key={entry.userId}
                                            className={cn(
                                                'flex items-center gap-4 p-3 rounded-lg border transition-colors hover:bg-muted/50',
                                                getRankBackground(entry.rank)
                                            )}
                                        >
                                            {/* Rank */}
                                            <div className="flex items-center justify-center w-10">
                                                {getRankIcon(entry.rank)}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1">
                                                <div className="font-medium">{entry.userId}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {entry.totalSubmissions} submissions
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="text-right">
                                                <div className="font-semibold text-primary">
                                                    {entry.problemsSolved} solved
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {entry.lastSolvedAt &&
                                                        `Last: ${new Date(entry.lastSolvedAt).toLocaleDateString()}`
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            <div className="flex justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 text-sm text-muted-foreground">
                                    Page {page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Daily Challenge */}
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Star className="h-5 w-5 text-primary" />
                                Daily Challenge
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dailyChallenge ? (
                                <div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                        {new Date(dailyChallenge.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <a
                                        href={`/problems/${dailyChallenge.problem.slug}`}
                                        className="block font-medium hover:text-primary transition-colors"
                                    >
                                        {dailyChallenge.problem.title}
                                    </a>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <Badge
                                            variant={
                                                dailyChallenge.problem.difficulty === 'Easy'
                                                    ? 'success'
                                                    : dailyChallenge.problem.difficulty === 'Medium'
                                                        ? 'warning'
                                                        : 'destructive'
                                            }
                                        >
                                            {dailyChallenge.problem.difficulty}
                                        </Badge>
                                        {dailyChallenge.problem.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button className="w-full mt-4" asChild>
                                        <a href={`/problems/${dailyChallenge.problem.slug}`}>
                                            Solve Now
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="animate-pulse">
                                    <div className="h-4 w-24 bg-muted rounded mb-2" />
                                    <div className="h-5 w-40 bg-muted rounded" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Your Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4 text-muted-foreground">
                                <p>Sign in to track your progress</p>
                                <Button className="mt-3" variant="outline" asChild>
                                    <a href="/auth/signin">Sign In</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
