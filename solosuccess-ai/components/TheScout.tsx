
import React, { useState } from 'react';
import { UserPlus, Users, FileText, CheckCircle2, AlertTriangle, Copy, Check, Loader2, Briefcase, ListTodo, Ear } from 'lucide-react';
import { generateJobDescription, generateInterviewGuide, generateSOP } from '../services/geminiService';
import { JobDescription, InterviewGuide, SOP } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

export const TheScout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'recruit' | 'vet' | 'delegate'>('recruit');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Recruit State
    const [roleTitle, setRoleTitle] = useState('');
    const [employmentType, setEmploymentType] = useState('Freelance');
    const [jd, setJd] = useState<JobDescription | null>(null);

    // Vet State
    const [vetRole, setVetRole] = useState('');
    const [vetFocus, setVetFocus] = useState('');
    const [guide, setGuide] = useState<InterviewGuide | null>(null);

    // Delegate State
    const [taskName, setTaskName] = useState('');
    const [sop, setSop] = useState<SOP | null>(null);

    const handleRecruit = async () => {
        if (!roleTitle.trim()) return;
        setLoading(true);
        setJd(null);
        soundService.playClick();
        const result = await generateJobDescription(roleTitle, employmentType);
        if (result) {
            setJd(result);

            // Save to Vault
            await storageService.saveJobDescription(result);

            addXP(40);
            showToast("JD GENERATED", "Recruitment beacon lit.", "xp", 40);
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const handleVet = async () => {
        if (!vetRole.trim() || !vetFocus.trim()) return;
        setLoading(true);
        setGuide(null);
        soundService.playClick();
        const result = await generateInterviewGuide(vetRole, vetFocus);
        if (result) {
            setGuide(result);
            addXP(40);
            showToast("GUIDE COMPILED", "Interrogation protocols ready.", "xp", 40);
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const handleDelegate = async () => {
        if (!taskName.trim()) return;
        setLoading(true);
        setSop(null);
        soundService.playClick();
        const result = await generateSOP(taskName);
        if (result) {
            setSop(result);
            addXP(50);
            showToast("SOP CODIFIED", "Delegation protocol established.", "xp", 50);
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        soundService.playClick();
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <UserPlus size={14} /> Talent Operations
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">THE SCOUT</h2>
                    <p className="text-zinc-400 mt-2">Recruit, Vet, and Delegate with military precision.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-zinc-800 overflow-x-auto pb-1 scrollbar-hide">
                <button onClick={() => setActiveTab('recruit')} className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === 'recruit' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                    <span className="flex items-center gap-2"><Briefcase size={16} /> Recruit</span>
                </button>
                <button onClick={() => setActiveTab('vet')} className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === 'vet' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                    <span className="flex items-center gap-2"><Ear size={16} /> Vet</span>
                </button>
                <button onClick={() => setActiveTab('delegate')} className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === 'delegate' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                    <span className="flex items-center gap-2"><ListTodo size={16} /> Delegate</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Input Column */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit">
                    {activeTab === 'recruit' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Job Configuration</h3>
                            <div>
                                <label className="block text-xs text-zinc-400 font-bold mb-1">Role Title</label>
                                <input type="text" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-indigo-500" placeholder="e.g. Social Media Manager" />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 font-bold mb-1">Type</label>
                                <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-indigo-500">
                                    <option>Freelance / Contract</option>
                                    <option>Full-Time Employee</option>
                                    <option>Part-Time</option>
                                </select>
                            </div>
                            <button onClick={handleRecruit} disabled={loading || !roleTitle.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase tracking-widest transition-all disabled:opacity-50 mt-4">
                                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Generate JD'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'vet' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Interview Setup</h3>
                            <div>
                                <label className="block text-xs text-zinc-400 font-bold mb-1">Role</label>
                                <input type="text" value={vetRole} onChange={(e) => setVetRole(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-indigo-500" placeholder="e.g. React Developer" />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 font-bold mb-1">Primary Focus</label>
                                <input type="text" value={vetFocus} onChange={(e) => setVetFocus(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-indigo-500" placeholder="e.g. Speed, Attention to Detail, Culture Fit" />
                            </div>
                            <button onClick={handleVet} disabled={loading || !vetRole.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase tracking-widest transition-all disabled:opacity-50 mt-4">
                                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Compile Questions'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'delegate' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">SOP Builder</h3>
                            <div>
                                <label className="block text-xs text-zinc-400 font-bold mb-1">Task Name</label>
                                <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-indigo-500" placeholder="e.g. Weekly Newsletter Formatting" />
                            </div>
                            <button onClick={handleDelegate} disabled={loading || !taskName.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase tracking-widest transition-all disabled:opacity-50 mt-4">
                                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Codify Process'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Output Column */}
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-8 min-h-[500px] relative overflow-y-auto custom-scrollbar">
                    {!jd && !guide && !sop && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                            <Users size={64} strokeWidth={1} />
                            <p className="mt-4 font-mono uppercase tracking-widest text-sm">Awaiting Personnel Directives</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-indigo-500">
                            <Loader2 size={48} className="animate-spin mb-4" />
                            <p className="font-mono uppercase tracking-widest animate-pulse">Consulting HR Matrix...</p>
                        </div>
                    )}

                    {activeTab === 'recruit' && jd && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{jd.roleTitle}</h2>
                                    <p className="text-indigo-400 italic text-lg mt-2">"{jd.hook}"</p>
                                </div>
                                <button onClick={() => copyToClipboard(JSON.stringify(jd, null, 2))} className="text-zinc-500 hover:text-white"><Copy size={16} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Responsibilities</h4>
                                    <ul className="space-y-2">
                                        {jd.responsibilities.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-indigo-500">›</span> {item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Requirements</h4>
                                    <ul className="space-y-2">
                                        {jd.requirements.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-indigo-500">•</span> {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-lg">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">The Perks (Why Us?)</h4>
                                <ul className="space-y-2">
                                    {jd.perks.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><CheckCircle2 size={14} className="text-indigo-500 mt-0.5" /> {item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vet' && guide && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4">Interview Protocol: {guide.roleTitle}</h2>
                            <div className="space-y-6">
                                {guide.questions.map((q, i) => (
                                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded font-bold text-xs shrink-0">{i + 1}</span>
                                            <p className="text-white font-medium">{q.question}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pl-9">
                                            <div className="text-emerald-400">
                                                <span className="font-bold text-xs uppercase block mb-1 text-emerald-600">Green Flag</span>
                                                {q.whatToLookFor}
                                            </div>
                                            <div className="text-red-400">
                                                <span className="font-bold text-xs uppercase block mb-1 text-red-600">Red Flag</span>
                                                {q.redFlag}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'delegate' && sop && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-zinc-800 pb-4">
                                <h2 className="text-2xl font-bold text-white">{sop.taskName}</h2>
                                <p className="text-zinc-400 text-sm mt-1">Goal: {sop.goal}</p>
                            </div>

                            <div className="space-y-4">
                                {sop.steps.map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-400">{step.step}</div>
                                            {i < sop.steps.length - 1 && <div className="w-0.5 flex-1 bg-zinc-800 my-2"></div>}
                                        </div>
                                        <div className="pb-4">
                                            <h4 className="text-white font-bold mb-1">{step.action}</h4>
                                            <p className="text-sm text-zinc-400 leading-relaxed">{step.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg flex items-start gap-3">
                                <CheckCircle2 className="text-emerald-500 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Definition of Done</h4>
                                    <p className="text-sm text-zinc-300">{sop.successCriteria}</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
