'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
                limit: '50', // Higher density = more items per page
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

    return (
        <div className="font-verdana text-[13px]">
            <div className="bg-white border border-[#CCCCCC] p-4 text-[#333333]">
                <h1 className="text-xl text-[#0056b3] font-bold mb-4">Problems</h1>

                {/* Filters */}
                <div className="flex gap-4 mb-4 items-center bg-[#F0F0F0] p-2 border border-[#CCCCCC]">
                    <div className="flex items-center gap-2">
                        <label className="font-bold">Search:</label>
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border border-[#CCCCCC] px-2 py-1 w-64"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="font-bold">Difficulty:</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="border border-[#CCCCCC] px-2 py-1 bg-white"
                        >
                            {difficulties.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dense Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left border border-[#CCCCCC]">
                        <thead>
                            <tr className="bg-[#FFFFFF] border-b border-[#CCCCCC]">
                                <th className="px-2 py-1 text-center w-12 border-r border-[#CCCCCC]">#</th>
                                <th className="px-2 py-1 border-r border-[#CCCCCC]">Name</th>
                                <th className="px-2 py-1 border-r border-[#CCCCCC]">Tags</th>
                                <th className="px-2 py-1 border-r border-[#CCCCCC] w-24 text-center">Difficulty</th>
                                <th className="px-2 py-1 w-24 text-center">Solved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-2 py-4 text-center">Loading...</td>
                                </tr>
                            ) : problems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-2 py-4 text-center">No problems found</td>
                                </tr>
                            ) : (
                                problems.map((problem, index) => (
                                    <tr key={problem.id} className="even:bg-[#F8F8F8] hover:bg-[#E8E8E8]">
                                        <td className="px-2 py-1 text-center border-r border-[#CCCCCC]">{problem.id}</td>
                                        <td className="px-2 py-1 border-r border-[#CCCCCC]">
                                            <Link
                                                href={`/problems/${problem.slug}`}
                                                className="text-[#0056b3] font-bold hover:underline"
                                            >
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td className="px-2 py-1 border-r border-[#CCCCCC]">
                                            <span className="text-[11px] text-gray-500">
                                                {problem.tags.join(', ')}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1 text-center border-r border-[#CCCCCC]">
                                            {problem.difficulty}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            {problem.solved && <span className="text-green-600 font-bold">✓</span>}
                                            {!problem.solved && <span className="text-gray-300">-</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border border-[#CCCCCC] disabled:opacity-50 hover:bg-[#E0E0E0]"
                        >
                            &larr; Prev
                        </button>
                        <span className="px-3 py-1">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1 border border-[#CCCCCC] disabled:opacity-50 hover:bg-[#E0E0E0]"
                        >
                            Next &rarr;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
