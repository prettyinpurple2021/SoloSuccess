import React from 'react';
import { X, Check, Lock } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
    requiredTier?: 'Solo' | 'Pro' | 'Agency';
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredTier = 'Solo' }: UpgradeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-zinc-900 rounded-3xl border border-emerald-500/20 overflow-hidden shadow-2xl shadow-emerald-500/10 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-emerald-900/20 to-transparent">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Lock className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Unlock {featureName}
                    </h2>
                    <p className="text-zinc-400">
                        Upgrade to the {requiredTier} plan to access this feature and more.
                    </p>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Comparison */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-zinc-400 text-sm uppercase tracking-wider">Free Plan</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-zinc-500">
                                <X className="w-5 h-5" />
                                <span>{featureName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-500">
                                <Check className="w-5 h-5" />
                                <span>Basic AI Generation</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-500">
                                <Check className="w-5 h-5" />
                                <span>1 Business Profile</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">{requiredTier} Plan</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white">
                                <Check className="w-5 h-5 text-emerald-400" />
                                <span className="font-bold">{featureName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white">
                                <Check className="w-5 h-5 text-emerald-400" />
                                <span>Unlimited AI Generation</span>
                            </div>
                            <div className="flex items-center gap-3 text-white">
                                <Check className="w-5 h-5 text-emerald-400" />
                                <span>Increased Storage</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-white/5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <div className="text-2xl font-bold text-white">$29<span className="text-sm text-zinc-400 font-normal">/mo</span></div>
                        <div className="text-xs text-emerald-400">30-day money-back guarantee</div>
                    </div>
                    <button className="w-full md:w-auto px-8 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}
