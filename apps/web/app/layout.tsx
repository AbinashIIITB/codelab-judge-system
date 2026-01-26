import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'CodeLab - Online Judge System',
    description: 'Practice coding problems, compete in contests, and improve your programming skills with CodeLab.',
    keywords: ['coding', 'programming', 'online judge', 'competitive programming', 'algorithms'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="min-h-screen bg-background">
                        <Navbar />
                        <main>{children}</main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
