'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for sign-in logic
        console.log('Sign in with:', { email, password });
        alert('Authentication is currently being set up. Use the "Guest" features for now.');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md p-8 bg-white border border-[#CCCCCC] shadow-sm">
                <h1 className="text-2xl font-bold mb-6 uppercase tracking-tight text-[#333333]">Sign In</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-[#555555]">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-[#CCCCCC] focus:outline-none focus:border-[#0056b3] text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-[#555555]">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-[#CCCCCC] focus:outline-none focus:border-[#0056b3] text-sm"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        LOGIN
                    </Button>
                </form>
                <p className="mt-4 text-xs text-center text-[#777777]">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="text-[#0056b3] hover:underline font-bold">
                        REGISTER
                    </Link>
                </p>
            </div>
        </div>
    );
}
