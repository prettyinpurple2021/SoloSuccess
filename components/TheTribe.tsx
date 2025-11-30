import React, { useState, useEffect } from 'react';
import { Flag, Users, Flame, Scroll, ArrowRight, Loader2, HeartHandshake, Save, Trash2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { TribeBlueprint } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';

export const TheTribe: React.FC = () => {
    const [audience, setAudience] = useState('');
    const [enemy, setEnemy] = useState('');
    const [loading, setLoading] = useState(false);
    const [blueprint, setBlueprint] = useState<TribeBlueprint | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('solo_tribe_blueprint');
        if (saved) {
            try { setBlueprint(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    const handleGenerate = async () => {
        if (!audience.trim() || !enemy.trim()) return;
        setLoading(true);
        soundService.playClick();

        const result = await geminiService.generateTribeBlueprint(audience, enemy);
        if (result) {
            setBlueprint(result);
            localStorage.setItem('solo_tribe_blueprint', JSON.stringify(result));

            const { leveledUp } = await addXP(100);
            showToast("TRIBE FOUNDED", "Community architecture defined.", "xp", 100);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("GEN FAILED", "Could not forge tribe.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const handleReset = () => {
        if (confirm("Dissolve existing tribe strategy?")) {
            setBlueprint(null);
            localStorage.removeItem('solo_tribe_blueprint');
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-pink-400 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Flag size={14} /> Community Architecture
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">THE TRIBE</h2>
                    <p className="text-zinc-400 mt-2">Design a cult brand, define your manifesto, and build true believers.</p>
                </div>
                {blueprint && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-xs font-bold text-red-500 border border-red-900/30 hover:bg-red-950/30 rounded transition-colors uppercase tracking-wider flex items-center justify-center w-full md:w-auto gap-2"
                    >
                        <Trash2 size={14} /> Reset Strategy
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col">

                {!blueprint ? (
                    <div className="max-w-2xl mx-auto w-full mt-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-4">Founding Principles</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Who are your people?</label>
                                    <input
                                        type="text"
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        placeholder="e.g., 'Burned out corporate designers seeking freedom'"
                                        className="w-full bg-black border border-zinc-700 rounded p-4 text-white focus:border-pink-500 focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Who is the enemy?</label>
                                    <input
                                        type="text"
                                        value={enemy}
                                        onChange={(e) => setEnemy(e.target.value)}
                                        placeholder="e.g., 'Soulless agency grind', 'Mediocrity', 'Gatekeepers'"
                                        className="w-full bg-black border border-zinc-700 rounded p-4 text-white focus:border-pink-500 focus:ring-0"
                                    />
                                    <p className="text-[10px] text-zinc-500 mt-2">* Every great tribe unites against a common enemy or status quo.</p>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !audience.trim() || !enemy.trim()}
                                    className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white rounded font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Flame size={18} /> Ignite The Tribe</>}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">

                        {/* Manifesto Card */}
                        <div className="bg-zinc-950 border border-pink-900/30 rounded-xl p-8 relative overflow-hidden flex flex-col">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-pink-500 mb-6">
                                    <Scroll size={20} />
                                    <span className="font-bold text-xs uppercase tracking-widest">The Manifesto</span>
                                </div>

                                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                                    {blueprint.manifesto.title}
                                </h1>

                                <div className="space-y-6 flex-1">
                                    <div className="bg-zinc-900/50 p-4 rounded border-l-2 border-pink-500">
                                        <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block mb-1">We Fight Against</span>
                                        <p className="text-lg text-zinc-200 font-medium">"{blueprint.manifesto.enemy}"</p>
                                    </div>

                                    <div className="bg-zinc-900/50 p-4 rounded border-l-2 border-emerald-500">
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">We Believe In</span>
                                        <p className="text-lg text-zinc-200 font-medium">"{blueprint.manifesto.belief}"</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                                    <p className="text-xl font-serif italic text-zinc-400">"{blueprint.manifesto.tagline}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Rituals & Loops */}
                        <div className="space-y-6">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users size={14} /> Sacred Rituals
                                </h3>
                                <div className="space-y-4">
                                    {blueprint.rituals.map((ritual, i) => (
                                        <div key={i} className="bg-black border border-zinc-800 p-4 rounded-lg group hover:border-zinc-600 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-white text-sm">{ritual.name}</h4>
                                                <span className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-zinc-400 uppercase">{ritual.frequency}</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mb-3">{ritual.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-pink-400 font-medium bg-pink-950/10 p-2 rounded">
                                                <ArrowRight size={12} /> {ritual.action}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <HeartHandshake size={14} /> Engagement Loops
                                </h3>
                                <ul className="space-y-3">
                                    {blueprint.engagementLoops.map((loop, i) => (
                                        <li key={i} className="flex flex-col gap-1 text-sm text-zinc-300">
                                            <div className="flex items-center gap-2">
                                                <span className="text-pink-500 font-bold">0{i + 1}</span>
                                                <span className="font-bold text-white">{loop.name}</span>
                                            </div>
                                            <div className="pl-6 text-xs text-zinc-500">
                                                <span className="text-zinc-400">Trigger:</span> {loop.trigger} → <span className="text-zinc-400">Action:</span> {loop.action} → <span className="text-zinc-400">Reward:</span> {loop.reward}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};