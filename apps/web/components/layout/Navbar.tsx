'use client';

import Link from 'next/link';

export function Navbar() {
    return (
        <nav className="bg-[#333333] h-[44px] text-white flex items-center px-4 w-full text-[13px] border-b border-[#CCCCCC]">
            <div className="flex items-center space-x-6 container mx-auto max-w-[1200px]">
                {/* Logo/Brand */}
                <Link href="/" className="font-bold hover:text-[#CCCCCC] transition-colors uppercase tracking-tight">
                    CodeLab
                </Link>

                {/* Desktop Navigation */}
                <div className="flex items-center space-x-6">
                    <Link
                        href="/"
                        className="hover:text-[#CCCCCC] transition-colors"
                    >
                        HOME
                    </Link>
                    <Link
                        href="/problems"
                        className="hover:text-[#CCCCCC] transition-colors"
                    >
                        PROBLEMS
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="hover:text-[#CCCCCC] transition-colors"
                    >
                        LEADERBOARD
                    </Link>
                </div>

                {/* Spacing to push Auth to right if needed, or keep left aligned as per Codeforces */}
                <div className="flex-1"></div>

                {/* Auth/Actions */}
                <div className="flex items-center space-x-4">
                    <Link href="/auth/signin" className="hover:text-[#CCCCCC] transition-colors">
                        ENTER
                    </Link>
                    <span className="text-gray-500">|</span>
                    <Link href="/auth/signup" className="hover:text-[#CCCCCC] transition-colors">
                        REGISTER
                    </Link>
                </div>
            </div>
        </nav>
    );
}
