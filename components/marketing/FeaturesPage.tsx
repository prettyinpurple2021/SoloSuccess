import React from 'react';
import { MarketingLayout } from './layout/MarketingLayout';
import { Target, Zap, Shield, Cpu, BarChart3, Users, Brain, Rocket, Lock } from 'lucide-react';

export function FeaturesPage() {
    return (
        <MarketingLayout>
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Everything You Need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Dominate Your Niche
                        </span>
                    </h1>
                    <p className="text-xl text-zinc-400">
                        A complete suite of AI-powered tools designed specifically for the modern solopreneur.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureDetail
                        icon={<Target className="w-8 h-8 text-emerald-400" />}
                        title="Strategic Planning"
                        description="AI-driven roadmaps that adapt to your progress. Set goals, track milestones, and get intelligent suggestions on what to focus on next."
                    />
                    <FeatureDetail
                        icon={<Zap className="w-8 h-8 text-cyan-400" />}
                        title="Rapid Execution"
                        description="Turn ideas into actionable tasks instantly. Our AI breaks down complex projects into manageable steps and helps you execute them."
                    />
                    <FeatureDetail
                        icon={<Shield className="w-8 h-8 text-violet-400" />}
                        title="Competitor Intelligence"
                        description="Monitor your competitors in real-time. Get alerts on their pricing changes, marketing strategies, and product launches."
                    />
                    <FeatureDetail
                        icon={<Brain className="w-8 h-8 text-pink-400" />}
                        title="AI Advisory Board"
                        description="Consult with specialized AI agents for marketing, legal, finance, and strategy. It's like having a C-suite in your pocket."
                    />
                    <FeatureDetail
                        icon={<BarChart3 className="w-8 h-8 text-yellow-400" />}
                        title="Financial Treasury"
                        description="Track revenue, expenses, and runway. Get AI-powered financial forecasts and budget optimization tips."
                    />
                    <FeatureDetail
                        icon={<Rocket className="w-8 h-8 text-orange-400" />}
                        title="Idea Incinerator"
                        description="Validate your business ideas against market data. Our AI ruthlessly critiques and refines your concepts before you invest time."
                    />
                </div>

                {/* CTA Section */}
                <div className="mt-32 p-12 rounded-3xl bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Ready to Build Your Empire?</h2>
                        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                            Join our beta cohort of ambitious solo founders building the future with AI.
                        </p>
                        <button className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25">
                            Start Free Trial
                        </button>
                        <p className="text-sm text-zinc-500 mt-4">14 days free · No credit card required</p>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}

function FeatureDetail({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all hover:bg-white/10 group">
            <div className="mb-6 p-3 rounded-xl bg-black/50 w-fit border border-white/10 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    );
}
