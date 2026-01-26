'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Code2, Menu, Moon, Sun, Trophy, BookOpen, Github } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <Code2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">CodeLab</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/problems"
                            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Problems</span>
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Trophy className="h-4 w-4" />
                            <span>Leaderboard</span>
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="hidden md:flex"
                        >
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        <Link href="https://github.com" target="_blank" className="hidden md:block">
                            <Button variant="ghost" size="icon">
                                <Github className="h-5 w-5" />
                            </Button>
                        </Link>

                        <Link href="/auth/signin" className="hidden md:block">
                            <Button variant="outline">Sign In</Button>
                        </Link>

                        <Link href="/auth/signup" className="hidden md:block">
                            <Button>Get Started</Button>
                        </Link>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border/40">
                        <div className="flex flex-col space-y-3">
                            <Link
                                href="/problems"
                                className="flex items-center space-x-2 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <BookOpen className="h-4 w-4" />
                                <span>Problems</span>
                            </Link>
                            <Link
                                href="/leaderboard"
                                className="flex items-center space-x-2 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Trophy className="h-4 w-4" />
                                <span>Leaderboard</span>
                            </Link>
                            <div className="flex items-center space-x-2 px-2 pt-3 border-t border-border/40">
                                <Link href="/auth/signin" className="flex-1">
                                    <Button variant="outline" className="w-full">Sign In</Button>
                                </Link>
                                <Link href="/auth/signup" className="flex-1">
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
