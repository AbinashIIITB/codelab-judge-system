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

const stats = [
    { value: '500+', label: 'Problems' },
    { value: '50K+', label: 'Users' },
    { value: '1M+', label: 'Submissions' },
    { value: '99.9%', label: 'Uptime' },
];

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
                            <Zap className="h-4 w-4" />
                            <span>New: Real-time collaborative coding</span>
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

            {/* Stats Section */}
            <section className="py-12 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
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
                        <div className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} CodeLab. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
