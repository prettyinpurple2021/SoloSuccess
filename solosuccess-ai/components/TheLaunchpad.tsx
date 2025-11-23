import React, { useState, useEffect } from 'react';
import { Rocket, Calendar, CheckCircle2, PlayCircle, Megaphone, Box, ArrowDown, Loader2, Trash2, Target } from 'lucide-react';
import { generateLaunchStrategy } from '../services/geminiService';
import { LaunchStrategy, Task, AgentId } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { AGENTS } from '../constants';
import { storageService } from '../services/storageService';

export const TheLaunchpad: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [launchDate, setLaunchDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [strategy, setStrategy] = useState<LaunchStrategy | null>(null);
    const [deployed, setDeployed] = useState(false);

    useEffect(() => {
        const loadStrategy = async () => {
            const strategies = await storageService.getLaunchStrategies();
            if (strategies.length > 0) {
                setStrategy(strategies[0]);
            }
        };
        loadStrategy();
    }, []);

    const handleGenerate = async () => {
        if (!productName.trim() || !launchDate) return;
        setLoading(true);
        setDeployed(false);
        soundService.playClick();

        const result = await generateLaunchStrategy(productName, launchDate);
        if (result) {
            setStrategy(result);
            // Save to Vault
            await storageService.saveLaunchStrategy(result);

            const { leveledUp } = await addXP(100);
            showToast("FLIGHT PLAN LOGGED", "Launch sequence initiated.", "xp", 100);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("SYSTEM ERROR", "Could not calculate trajectory.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const handleDeploy = async () => {
        if (!strategy) return;
        const currentTasks = await storageService.getTasks();

        const newTasks: Task[] = [];
        strategy.phases.forEach((phase, pIdx) => {
            phase.events.forEach((event, eIdx) => {
                newTasks.push({
                    id: `task-launch-${strategy.id}-${pIdx}-${eIdx}`,
                    title: `[${event.day}] ${event.title}`,
                    description: `${event.description} (Channel: ${event.channel})`,
                    assignee: event.owner as AgentId,
                    status: 'todo',
                    priority: phase.name.includes('Launch Day') ? 'high' : 'medium',
                    estimatedTime: '2h',
                    createdAt: new Date().toISOString()
                });
            });
        });

        const updatedTasks = [...currentTasks, ...newTasks];
        await storageService.saveTasks(updatedTasks);
        setDeployed(true);

        const { leveledUp } = await addXP(75);
        showToast("IGNITION SEQUENCE START", "Tasks deployed to Roadmap.", "xp", 75);
        if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
        soundService.playSuccess();
    };

    const handleReset = () => {
        if (confirm("Abort mission and clear flight plan?")) {
            setStrategy(null);
            setDeployed(false);
            // Note: We don't delete from history, just clear current view
            soundService.playError();
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-orange-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Rocket size={14} /> Go-To-Market Control
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">THE LAUNCHPAD</h2>
                    <p className="text-zinc-400 mt-2">Orchestrate product launches with military precision.</p>
                </div>
                {strategy && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-xs font-bold text-red-500 border border-red-900/30 hover:bg-red-950/30 rounded transition-colors uppercase tracking-wider flex items-center gap-2"
                    >
                        <Trash2 size={14} /> Abort Mission
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col">

                {!strategy ? (
                    <div className="max-w-2xl mx-auto w-full mt-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-4 relative z-10">Mission Parameters</h3>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Payload (Product/Feature)</label>
                                    <div className="flex items-center bg-black border border-zinc-700 rounded px-4 py-2 focus-within:border-orange-500 transition-colors">
                                        <Box size={18} className="text-zinc-500 mr-3" />
                                        <input
                                            type="text"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            placeholder="e.g., 'SoloSuccess v2.0'"
                                            className="w-full bg-transparent text-white focus:ring-0 border-none p-0 placeholder-zinc-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">T-Minus Zero (Launch Date)</label>
                                    <div className="flex items-center bg-black border border-zinc-700 rounded px-4 py-2 focus-within:border-orange-500 transition-colors">
                                        <Calendar size={18} className="text-zinc-500 mr-3" />
                                        <input
                                            type="date"
                                            value={launchDate}
                                            onChange={(e) => setLaunchDate(e.target.value)}
                                            className="w-full bg-transparent text-white focus:ring-0 border-none p-0 placeholder-zinc-600"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !productName.trim() || !launchDate}
                                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Rocket size={18} /> Calculate Flight Plan</>}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in zoom-in-95 duration-500 flex flex-col h-full">

                        {/* Timeline View */}
                        <div className="flex-1 relative pl-4 md:pl-8 pb-20 border-l border-zinc-800 ml-2 md:ml-10">

                            {strategy.phases.map((phase, pIdx) => (
                                <div key={pIdx} className="mb-12 relative">
                                    {/* Phase Marker */}
                                    <div className="absolute -left-8 md:-left-12 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 z-10">
                                        <div className={`w-3 h-3 rounded-full ${pIdx === 1 ? 'bg-orange-500 animate-pulse' : 'bg-zinc-500'}`}></div>
                                    </div>

                                    <h3 className={`text-xl font-black uppercase tracking-tight mb-6 ml-4 ${pIdx === 1 ? 'text-orange-500' : 'text-white'}`}>
                                        {phase.name}
                                    </h3>

                                    <div className="space-y-4 ml-4">
                                        {phase.events.map((event, eIdx) => {
                                            const agent = AGENTS[event.owner as AgentId];
                                            return (
                                                <div key={eIdx} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 group hover:border-zinc-600 transition-all">
                                                    <div className="md:w-32 shrink-0">
                                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{event.day}</div>
                                                        <div className={`text-[10px] font-mono px-2 py-1 rounded w-fit ${agent.color.replace('text-', 'bg-').replace('400', '900/30').replace('500', '900/30')} ${agent.color}`}>
                                                            {agent.name}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white text-sm mb-1">{event.title}</h4>
                                                        <p className="text-xs text-zinc-400 leading-relaxed">{event.description}</p>
                                                    </div>
                                                    <div className="md:w-32 shrink-0 flex items-center text-xs text-zinc-500 font-mono uppercase border-l border-zinc-800/50 pl-4">
                                                        <Target size={12} className="mr-2" /> {event.channel}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* Sticky Footer Action */}
                        <div className="sticky bottom-0 bg-black/80 backdrop-blur border-t border-zinc-800 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center z-20 gap-4 md:gap-0">
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Target: {strategy.productName}</p>
                                <p className="text-sm text-white font-mono">Launch Date: {new Date(strategy.launchDate).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={handleDeploy}
                                disabled={deployed}
                                className={`flex items-center justify-center w-full md:w-auto gap-3 px-8 py-4 rounded font-bold text-sm uppercase tracking-widest transition-all shadow-xl
                                    ${deployed
                                        ? 'bg-emerald-600 text-white cursor-default'
                                        : 'bg-orange-600 hover:bg-orange-500 text-white hover:scale-105'
                                    }`}
                            >
                                {deployed ? <CheckCircle2 size={18} /> : <PlayCircle size={18} />}
                                {deployed ? 'Sequence Active' : 'Deploy to Roadmap'}
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};