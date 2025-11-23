
import React, { useState } from 'react';
import { Spline, GitBranch, AlertTriangle, ThumbsUp, ArrowRight, Activity, Loader2, Crosshair } from 'lucide-react';
import { runSimulation } from '../services/geminiService';
import { SimulationResult, ScenarioOutcome } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

export const TheSimulator: React.FC = () => {
    const [scenario, setScenario] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    const handleSimulate = async () => {
        if (!scenario.trim()) return;
        setLoading(true);
        setResult(null);
        soundService.playClick();

        const sim = await runSimulation(scenario);
        if (sim) {
            setResult(sim);

            // Save to Vault
            await storageService.saveSimulation(sim);

            const { leveledUp } = await addXP(80);
            showToast("SIMULATION COMPLETE", "Timeline branches projected.", "xp", 80);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("SIMULATION FAILED", "Could not project timelines.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const TimelineCard = ({ outcome, type }: { outcome: ScenarioOutcome, type: 'likely' | 'best' | 'worst' }) => {
        const colors =
            type === 'best' ? 'border-emerald-500/50 bg-emerald-950/10 text-emerald-400' :
                type === 'worst' ? 'border-red-500/50 bg-red-950/10 text-red-400' :
                    'border-blue-500/50 bg-blue-950/10 text-blue-400';

        const Icon =
            type === 'best' ? ThumbsUp :
                type === 'worst' ? AlertTriangle :
                    Activity;

        return (
            <div className={`border rounded-xl p-6 flex flex-col h-full transition-all hover:bg-zinc-900/80 ${colors}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                        <Icon size={14} /> {type} Case
                    </div>
                    <div className="text-2xl font-black">{outcome.probability}%</div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{outcome.title}</h3>
                <p className="text-sm text-zinc-300 mb-4 flex-1">{outcome.description}</p>

                <div className="space-y-3 border-t border-white/10 pt-4">
                    <div className="text-[10px] font-mono uppercase text-zinc-500">Timeline: {outcome.timeline}</div>
                    {outcome.keyEvents.map((event, i) => (
                        <div key={i} className="flex gap-3 items-start text-xs">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50"></div>
                            <span className="text-zinc-300">{event}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <GitBranch size={14} /> Predictive Modeling
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">THE SIMULATOR</h2>
                    <p className="text-zinc-400 mt-2">Analyze potential futures and risk timelines.</p>
                </div>
            </div>

            {/* Input */}
            <div className="max-w-3xl mx-auto w-full mb-12">
                <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg flex gap-2 shadow-lg relative group focus-within:border-indigo-500 transition-colors">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                        <Spline size={20} />
                    </div>
                    <input
                        type="text"
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                        placeholder="What if... (e.g. 'We lose our biggest client' or 'We pivot to AI')"
                        className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-lg text-white focus:ring-0 placeholder-zinc-600 font-medium"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSimulate}
                        disabled={loading || !scenario.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Simulate'}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="flex-1">
                {!result && !loading && (
                    <div className="flex flex-col items-center justify-center text-zinc-700 opacity-50 h-64">
                        <GitBranch size={64} strokeWidth={1} />
                        <p className="mt-4 font-mono uppercase tracking-widest text-sm">No Active Simulation</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center text-indigo-500 h-64">
                        <div className="w-16 h-16 border-4 border-indigo-900/30 rounded border-t-indigo-500 animate-spin mb-4"></div>
                        <p className="font-mono uppercase tracking-widest animate-pulse">Calculating Probability Matrices...</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        {/* Timeline Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TimelineCard outcome={result.likelyCase} type="likely" />
                            <TimelineCard outcome={result.bestCase} type="best" />
                            <TimelineCard outcome={result.worstCase} type="worst" />
                        </div>

                        {/* Strategic Advice */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Crosshair size={14} /> Strategic Recommendation
                            </h3>
                            <p className="text-xl text-zinc-200 leading-relaxed font-medium">
                                "{result.strategicAdvice}"
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
