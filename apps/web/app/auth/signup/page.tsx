'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for sign-up logic
        console.log('Sign up with:', { name, email, password });
        alert('Registration is currently being set up. Use the "Guest" features for now.');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md p-8 bg-white border border-[#CCCCCC] shadow-sm">
                <h1 className="text-2xl font-bold mb-6 uppercase tracking-tight text-[#333333]">Register</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-[#555555]">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-[#CCCCCC] focus:outline-none focus:border-[#0056b3] text-sm"
                            required
                        />
                    </div>
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
                        CREATE ACCOUNT
                    </Button>
                </form>
                <p className="mt-4 text-xs text-center text-[#777777]">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-[#0056b3] hover:underline font-bold">
                        LOGIN
                    </Link>
                </p>
            </div>
        </div>
    );
}
