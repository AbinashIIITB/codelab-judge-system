import Link from 'next/link';
import { ArrowRight, Code2, Trophy, Zap, Shield, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const features = [
    {
        icon: Zap,
        title: 'Real-time Judging',
        description: 'Get instant feedback on your code with our lightning-fast execution engine.',
    },
    {
        icon: Shield,
        title: 'Secure Sandbox',
        description: 'Execute code safely in isolated Docker containers with strict resource limits.',
    },
    {
        icon: Code2,
        title: 'Multiple Languages',
        description: 'Write solutions in C++, Python, Java, or JavaScript with full syntax highlighting.',
    },
    {
        icon: Trophy,
        title: 'Live Leaderboards',
        description: 'Compete globally and track your progress against other developers.',
    },
    {
        icon: Users,
        title: 'Community Driven',
        description: 'Join thousands of developers improving their skills every day.',
    },
    {
        icon: Clock,
        title: 'Daily Challenges',
        description: 'New problems every day to keep your skills sharp and consistent.',
    },
];

// stats array removed as it is no longer used

export default function HomePage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 sm:py-32">
                {/* Background gradient */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/30 rounded-full blur-3xl opacity-20" />
                </div>

                <div className="container mx-auto px-4">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm mb-6">
                            <Code2 className="h-4 w-4" />
                            <span>Built with Next.js, Docker, Monorepo, & Microservices</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                            Master Algorithms with{' '}
                            <span className="gradient-text">CodeLab</span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Practice coding problems, compete in real-time contests, and level up your
                            programming skills with our powerful online judge system.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/problems">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Start Coding
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/leaderboard">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                    View Leaderboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Project Info Section */}
            <section className="py-12 bg-muted/50 border-y border-[#CCCCCC]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-around items-center gap-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-[#333333] mb-1">Project by</h3>
                            <p className="text-lg text-[#555555]">Abinash Mohanty</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-[#333333] mb-1">Institution</h3>
                            <p className="text-lg text-[#555555]">IIIT Bhubaneswar</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-[#333333] mb-1">Status</h3>
                            <div className="flex items-center gap-2 justify-center text-lg text-[#555555]">
                                <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                99.9% Uptime
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Everything You Need to Excel
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our platform provides all the tools you need to practice, learn, and
                            compete in competitive programming.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="relative overflow-hidden group hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Join thousands of developers who are improving their coding skills every day.
                    </p>
                    <Link href="/auth/signup">
                        <Button size="lg">
                            Create Free Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Code2 className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="font-semibold">CodeLab</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <div className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} CodeLab. All rights reserved.
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Project by <span className="font-semibold text-[#333333]">Abinash Mohanty</span> • <span className="font-semibold text-[#333333]">IIIT Bhubaneswar</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
