
import React, { useState } from 'react';
import { Crown, Briefcase, Loader2, CheckCircle2, TrendingUp, AlertOctagon, FileText } from 'lucide-react';
import { generateBoardMeetingReport } from '../services/geminiService';
import { BoardMeetingReport, AgentId } from '../types';
import { AGENTS } from '../constants';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

export const TheBoardroom: React.FC = () => {
    const [report, setReport] = useState<BoardMeetingReport | null>(null);
    const [loading, setLoading] = useState(false);

    const handleConvene = async () => {
        setLoading(true);
        setReport(null);
        soundService.playClick();


        // Fetch data from DB via storageService
        const context = await storageService.getContext();
        const financials = {
            currentCash: context?.currentCash || 0,
            monthlyBurn: context?.monthlyBurn || 0,
            monthlyRevenue: context?.monthlyRevenue || 0,
            growthRate: context?.growthRate || 0
        };

        const tasks = await storageService.getTasks();
        const reports = await storageService.getCompetitorReports();

        // Network still on localStorage for now
        const contacts = JSON.parse(localStorage.getItem('solo_network') || '[]');

        // Default fallbacks if data missing
        if (!financials.currentCash) financials.currentCash = 0;

        const result = await generateBoardMeetingReport(financials, tasks, reports, contacts);

        if (result) {
            setReport(result);
            const { leveledUp } = await addXP(150);
            showToast("BOARD MEETING ADJOURNED", "Quarterly review generated.", "xp", 150);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("MEETING CANCELED", "Could not convene board.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-emerald-500 border-emerald-500 bg-emerald-950/20';
            case 'B': return 'text-blue-500 border-blue-500 bg-blue-950/20';
            case 'C': return 'text-yellow-500 border-yellow-500 bg-yellow-950/20';
            case 'D': return 'text-orange-500 border-orange-500 bg-orange-950/20';
            default: return 'text-red-500 border-red-500 bg-red-950/20';
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-amber-200 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Crown size={14} /> Executive Review
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">THE BOARDROOM</h2>
                    <p className="text-zinc-400 mt-2">Holistic Quarterly Business Review (QBR) and Grading.</p>
                </div>
                <button
                    onClick={handleConvene}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/10"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Briefcase size={18} />}
                    {loading ? 'Board in Session...' : 'Convene Board'}
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                {!report && !loading && (
                    <div className="text-center opacity-50 text-zinc-500">
                        <div className="w-24 h-24 border-4 border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Boardroom Empty</h3>
                        <p className="font-mono uppercase tracking-widest text-sm">Call a meeting to review company performance.</p>
                    </div>
                )}

                {loading && (
                    <div className="w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            <span>Gathering Intelligence...</span>
                            <span className="animate-pulse">Processing</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-white animate-[width_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
                        </div>
                        <div className="mt-8 grid grid-cols-5 gap-4 opacity-50">
                            {Object.values(AGENTS).map(a => (
                                <div key={a.id} className="flex flex-col items-center animate-pulse">
                                    <img src={a.avatar} className="w-12 h-12 rounded-full grayscale mb-2" alt={a.name} />
                                    <span className="text-[10px] font-mono">{a.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {report && (
                    <div className="w-full max-w-6xl animate-in slide-in-from-bottom-8 duration-700">

                        {/* CEO Score Card */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 to-transparent pointer-events-none"></div>
                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="shrink-0 text-center">
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">CEO Performance Score</div>
                                    <div className="relative w-40 h-40 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="8" />
                                            <circle
                                                cx="50" cy="50" r="45" fill="none" stroke="#fff" strokeWidth="8"
                                                strokeDasharray="283"
                                                strokeDashoffset={283 - (283 * report.ceoScore / 100)}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute text-5xl font-black text-white">{report.ceoScore}</div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4">Executive Summary</h3>
                                    <p className="text-base md:text-lg text-zinc-300 leading-relaxed font-medium">
                                        "{report.executiveSummary}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Department Grades */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                            {report.grades.map((grade, i) => {
                                const agent = AGENTS[grade.agentId];
                                return (
                                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col relative group hover:border-zinc-600 transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <img src={agent.avatar} className="w-10 h-10 rounded-full border border-zinc-700" alt={agent.name} />
                                            <div>
                                                <div className={`text-xs font-bold uppercase ${agent.color}`}>{agent.name}</div>
                                                <div className="text-[10px] text-zinc-500 font-mono">{grade.department}</div>
                                            </div>
                                        </div>

                                        <div className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg border-2 font-black text-xl ${getGradeColor(grade.grade)}`}>
                                            {grade.grade}
                                        </div>

                                        <div className="text-xs text-zinc-300 mb-4 min-h-[60px]">
                                            "{grade.summary}"
                                        </div>

                                        <div className="mt-auto pt-3 border-t border-zinc-800">
                                            <div className="text-[10px] font-bold text-red-500 uppercase mb-1 flex items-center gap-1">
                                                <AlertOctagon size={10} /> Critical Issue
                                            </div>
                                            <div className="text-xs text-zinc-400">{grade.keyIssue}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Final Consensus */}
                        <div className="bg-white text-black rounded-xl p-8 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 border-b border-zinc-200 pb-4">
                                <CheckCircle2 className="text-emerald-600" size={24} />
                                <h3 className="text-xl font-black uppercase tracking-tight">Board Consensus & Direction</h3>
                            </div>
                            <p className="text-lg font-medium leading-relaxed">
                                {report.consensus}
                            </p>
                            <div className="mt-6 flex justify-end">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                    <FileText size={14} /> Report Generated: {new Date(report.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};
