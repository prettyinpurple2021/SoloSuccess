
import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, MessageSquare, Play, Trophy, RefreshCw, User, Bot, ArrowRight, Swords, AlertTriangle } from 'lucide-react';
import { RoleplayScenario, RoleplayTurn, RoleplayFeedback } from '../types';
import { getRoleplayReply, evaluateRoleplaySession } from '../services/geminiService';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

const SCENARIOS: RoleplayScenario[] = [
    {
        id: 'pitch-vc',
        title: 'The Skeptical VC',
        description: 'You have 2 minutes to hook a busy venture capitalist who has heard it all before.',
        difficulty: 'VETERAN',
        opponentRole: 'Venture Capitalist',
        opponentPersona: 'Impatient, numbers-focused, skeptical of buzzwords, checks phone constantly.',
        objective: 'Get a commitment for a follow-up meeting.'
    },
    {
        id: 'sales-cold',
        title: 'Cold Call Challenge',
        description: 'Get past the gatekeeper and pitch your product to a busy decision maker.',
        difficulty: 'ROOKIE',
        opponentRole: 'Small Business Owner',
        opponentPersona: 'Stressed, tight budget, wary of salespeople, but needs a solution.',
        objective: 'Book a demo.'
    },
    {
        id: 'negotiate-salary',
        title: 'Rate Negotiation',
        description: 'A client wants to hire you but thinks your rates are too high.',
        difficulty: 'VETERAN',
        opponentRole: 'Procurement Manager',
        opponentPersona: 'Professional negotiator, uses silence as a weapon, anchoring low.',
        objective: 'Close the deal without discounting more than 10%.'
    },
    {
        id: 'angry-customer',
        title: 'Crisis Management',
        description: 'A key client is furious about a bug that cost them money.',
        difficulty: 'NIGHTMARE',
        opponentRole: 'Enterprise Client',
        opponentPersona: 'Furious, shouting, threatening to cancel contract and sue.',
        objective: 'De-escalate the situation and retain the account.'
    }
];

export const TheAcademy: React.FC = () => {
    const [activeScenario, setActiveScenario] = useState<RoleplayScenario | null>(null);
    const [history, setHistory] = useState<RoleplayTurn[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<RoleplayFeedback | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, loading]);

    const startScenario = (scenario: RoleplayScenario) => {
        setActiveScenario(scenario);
        setHistory([]);
        setFeedback(null);
        setLoading(false);
        soundService.playClick();
    };

    const handleSend = async () => {
        if (!input.trim() || !activeScenario) return;

        const userMsg: RoleplayTurn = { role: 'user', text: input };
        const newHistory = [...history, userMsg];
        setHistory(newHistory);
        setInput('');
        setLoading(true);
        soundService.playClick();

        const reply = await getRoleplayReply(activeScenario, newHistory, input);

        setHistory([...newHistory, { role: 'opponent', text: reply }]);
        setLoading(false);
        soundService.playTyping();
    };

    const handleFinish = async () => {
        if (!activeScenario || history.length < 2) return;
        setLoading(true);
        const result = await evaluateRoleplaySession(activeScenario, history);
        if (result) {
            setFeedback(result);

            // PRODUCTION NOTE: Saving to storageService
            await storageService.saveTrainingResult(result);

            const { leveledUp } = await addXP(result.score); // XP based on performance
            showToast("SIMULATION ENDED", `Score: ${result.score}/100`, "xp", result.score);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <GraduationCap size={14} /> Skill Acquisition
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">THE ACADEMY</h2>
                    <p className="text-zinc-400 mt-2">Interactive roleplay simulations to sharpen your edge.</p>
                </div>
                {activeScenario && !feedback && (
                    <button
                        onClick={handleFinish}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        End Simulation
                    </button>
                )}
            </div>

            {!activeScenario ? (
                // Scenario Selection
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {SCENARIOS.map(scenario => (
                        <div
                            key={scenario.id}
                            onClick={() => startScenario(scenario)}
                            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-6 rounded-xl cursor-pointer group transition-all flex flex-col h-full relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 ${scenario.difficulty === 'ROOKIE' ? 'bg-emerald-500' :
                                scenario.difficulty === 'VETERAN' ? 'bg-amber-500' :
                                    'bg-red-600'
                                }`} />

                            <div className="flex justify-between items-start mb-4">
                                <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${scenario.difficulty === 'ROOKIE' ? 'bg-emerald-900/30 text-emerald-500' :
                                    scenario.difficulty === 'VETERAN' ? 'bg-amber-900/30 text-amber-500' :
                                        'bg-red-900/30 text-red-500'
                                    }`}>
                                    {scenario.difficulty}
                                </div>
                                <Swords size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{scenario.title}</h3>
                            <p className="text-sm text-zinc-400 mb-6 flex-1">{scenario.description}</p>

                            <div className="mt-auto pt-4 border-t border-zinc-800">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Objective</p>
                                <p className="text-xs text-zinc-300">{scenario.objective}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Simulation Interface
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-250px)] min-h-[500px]">

                    {/* Chat Area */}
                    <div className="lg:col-span-2 flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="bg-zinc-900/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">{activeScenario.title}</h3>
                                <p className="text-xs text-zinc-500 font-mono uppercase">Opponent: {activeScenario.opponentRole}</p>
                            </div>
                            <button onClick={() => setActiveScenario(null)} className="text-xs text-zinc-500 hover:text-white uppercase font-bold">Abort</button>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {history.length === 0 && (
                                <div className="text-center text-zinc-600 py-10 font-mono text-sm uppercase tracking-widest">
                                    Simulation Ready. Make your opening move.
                                </div>
                            )}
                            {history.map((turn, i) => (
                                <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-xl ${turn.role === 'user'
                                        ? 'bg-zinc-800 text-white rounded-tr-none'
                                        : 'bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-tl-none'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase opacity-50">
                                            {turn.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                                            <span>{turn.role === 'user' ? 'You' : activeScenario.opponentRole}</span>
                                        </div>
                                        <p className="text-sm leading-relaxed">{turn.text}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && !feedback && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl rounded-tl-none">
                                        <div className="flex gap-1 h-4 items-center">
                                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!feedback && (
                            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your response..."
                                        className="flex-1 bg-black border border-zinc-700 rounded px-4 py-3 text-white focus:border-white focus:ring-0"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        className="bg-white text-black px-4 rounded hover:bg-zinc-200 transition-colors"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback / Info Panel */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Mission Intel</h4>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="block text-zinc-400 font-bold mb-1">Objective</span>
                                    <p className="text-zinc-300">{activeScenario.objective}</p>
                                </div>
                                <div>
                                    <span className="block text-zinc-400 font-bold mb-1">Opponent Profile</span>
                                    <p className="text-zinc-300">{activeScenario.opponentPersona}</p>
                                </div>
                            </div>
                        </div>

                        {feedback && (
                            <div className="bg-zinc-950 border border-emerald-500/30 rounded-xl p-6 flex-1 animate-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                                    <Trophy className="text-amber-500" size={24} />
                                    <div>
                                        <h3 className="font-black text-xl text-white">PERFORMANCE REVIEW</h3>
                                        <p className="text-xs font-mono text-zinc-500 uppercase">Session Complete</p>
                                    </div>
                                    <div className="ml-auto text-3xl font-black text-white">{feedback.score}</div>
                                </div>

                                <div className="space-y-6 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    <div>
                                        <h5 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Strengths</h5>
                                        <ul className="space-y-2">
                                            {feedback.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                                    <span className="text-emerald-500">+</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Weaknesses</h5>
                                        <ul className="space-y-2">
                                            {feedback.weaknesses.map((w, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                                    <span className="text-red-500">-</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
                                        <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <AlertTriangle size={12} /> Pro Tip
                                        </h5>
                                        <p className="text-sm text-zinc-300 leading-relaxed">{feedback.proTip}</p>
                                    </div>

                                    <button
                                        onClick={() => setActiveScenario(null)}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold uppercase tracking-widest text-xs transition-all"
                                    >
                                        Start New Simulation
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};
