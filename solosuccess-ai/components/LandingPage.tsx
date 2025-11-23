import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Target, Cpu, BarChart3, Users } from 'lucide-react';

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="font-bold text-black text-lg">S</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">SOLO_SUCCESS<span className="text-emerald-400">_AI</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        AI-Powered Solopreneurship
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        Build Your Empire <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                            With Artificial Intelligence
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        The all-in-one operating system for solopreneurs. Automate strategy,
                        track competitors, and execute with precision using advanced AI agents.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <button
                            onClick={() => navigate('/signup')}
                            className="group relative px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25 w-full sm:w-auto"
                        >
                            Start Building Free
                            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto backdrop-blur-sm"
                        >
                            Live Demo
                        </button>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-32">
                    <FeatureCard
                        icon={<Target className="w-6 h-6 text-emerald-400" />}
                        title="Strategic Planning"
                        description="AI-driven roadmaps that adapt to your progress and market conditions in real-time."
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-cyan-400" />}
                        title="Rapid Execution"
                        description="Turn ideas into actionable tasks with automated workflows and intelligent assistance."
                    />
                    <FeatureCard
                        icon={<Shield className="w-6 h-6 text-violet-400" />}
                        title="Market Intelligence"
                        description="Monitor competitors and identify opportunities before anyone else does."
                    />
                </div>

                {/* Dashboard Preview */}
                <div className="mt-32 relative rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-emerald-900/20 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="ml-4 px-3 py-1 rounded-md bg-black/50 text-xs text-zinc-500 font-mono w-64">solosuccess.ai/dashboard</div>
                    </div>
                    <div className="aspect-[16/9] w-full bg-zinc-900/50 flex items-center justify-center text-zinc-700 font-mono text-sm">
                        [Dashboard Interface Preview]
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-black/50 backdrop-blur-sm relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-zinc-500 text-sm">
                        © 2024 SoloSuccess AI. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm text-zinc-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 group">
            <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    );
}
