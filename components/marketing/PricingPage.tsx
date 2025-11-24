import React from 'react';
import { MarketingLayout } from './layout/MarketingLayout';
import { Check } from 'lucide-react';

export function PricingPage() {
    return (
        <MarketingLayout>
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Start for free, upgrade as you scale. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter Plan */}
                    <PricingCard
                        title="Starter"
                        price="$0"
                        description="Perfect for validating your first idea."
                        features={[
                            "Basic Strategic Roadmap",
                            "3 Active Projects",
                            "Limited AI Credits",
                            "Community Support"
                        ]}
                    />

                    {/* Pro Plan */}
                    <PricingCard
                        title="Professional"
                        price="$79"
                        period="/month"
                        description="For serious solopreneurs scaling their business."
                        isPopular
                        features={[
                            "Everything in Starter",
                            "Unlimited AI Generations",
                            "Unlimited Competitors",
                            "3 Business Profiles",
                            "Priority Support (24hr)",
                            "Email Integration (Coming Soon)",
                            "Cash Flow Forecasting",
                            "Custom Branding"
                        ]}
                    />

                    {/* Empire Plan */}
                    <PricingCard
                        title="Empire"
                        price="$99"
                        period="/month"
                        description="Maximum power for established businesses."
                        features={[
                            "Everything in Pro",
                            "Unlimited Competitor Tracking",
                            "Custom AI Agent Training",
                            "API Access",
                            "Dedicated Account Manager",
                            "White-label Reports"
                        ]}
                    />
                </div>
            </div>
        </MarketingLayout>
    );
}

function PricingCard({ title, price, period, description, features, isPopular }: {
    title: string,
    price: string,
    period?: string,
    description: string,
    features: string[],
    isPopular?: boolean
}) {
    return (
        <div className={`relative p-8 rounded-2xl border ${isPopular ? 'bg-white/10 border-emerald-500 shadow-2xl shadow-emerald-500/20' : 'bg-white/5 border-white/10'} flex flex-col`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full uppercase tracking-wide">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-white">{price}</span>
                    {period && <span className="text-zinc-400">{period}</span>}
                </div>
                <p className="text-zinc-400 text-sm">{description}</p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${isPopular ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-zinc-400'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-zinc-300 text-sm">{feature}</span>
                    </div>
                ))}
            </div>

            <button className={`w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${isPopular
                ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/25'
                : 'bg-white text-black hover:bg-zinc-200'
                }`}>
                Choose {title}
            </button>
        </div>
    );
}
