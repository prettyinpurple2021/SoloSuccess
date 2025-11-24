import React, { useState, useEffect } from 'react';
import { BookTemplate, Fingerprint, Sliders, Users, ShieldBan, Save, Plus, X } from 'lucide-react';
import { BrandDNA, TargetPersona } from '../types';
import { showToast, addXP } from '../services/gameService';
import { soundService } from '../services/soundService';

const DEFAULT_DNA: BrandDNA = {
    tone: {
        formalVsCasual: 50,
        playfulVsSerious: 50,
        modernVsClassic: 50
    },
    personas: [],
    coreValues: [],
    bannedWords: []
};

export const TheCodex: React.FC = () => {
    const [dna, setDna] = useState<BrandDNA>(DEFAULT_DNA);
    const [newValue, setNewValue] = useState('');
    const [newBan, setNewBan] = useState('');
    const [saved, setSaved] = useState(false);

    // Persona State
    const [personaName, setPersonaName] = useState('');
    const [personaDesc, setPersonaDesc] = useState('');
    const [activeTab, setActiveTab] = useState<'dna' | 'personas'>('dna');

    useEffect(() => {
        const savedDna = localStorage.getItem('solo_brand_dna');
        if (savedDna) {
            try {
                setDna(JSON.parse(savedDna));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handleSave = async () => {
        localStorage.setItem('solo_brand_dna', JSON.stringify(dna));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        soundService.playSuccess();
        const { leveledUp } = await addXP(25);
        showToast("CODEX UPDATED", "Brand DNA sequence stored.", "xp", 25);
        if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
    };

    const addValue = () => {
        if (!newValue.trim()) return;
        setDna({ ...dna, coreValues: [...dna.coreValues, newValue.trim()] });
        setNewValue('');
    };

    const removeValue = (index: number) => {
        setDna({ ...dna, coreValues: dna.coreValues.filter((_, i) => i !== index) });
    };

    const addBan = () => {
        if (!newBan.trim()) return;
        setDna({ ...dna, bannedWords: [...dna.bannedWords, newBan.trim()] });
        setNewBan('');
    };

    const removeBan = (index: number) => {
        setDna({ ...dna, bannedWords: dna.bannedWords.filter((_, i) => i !== index) });
    };

    const addPersona = () => {
        if (!personaName.trim() || !personaDesc.trim()) return;
        const newPersona: TargetPersona = {
            name: personaName,
            description: personaDesc,
            painPoints: []
        };
        setDna({ ...dna, personas: [...dna.personas, newPersona] });
        setPersonaName('');
        setPersonaDesc('');
        soundService.playClick();
    };

    const removePersona = (index: number) => {
        setDna({ ...dna, personas: dna.personas.filter((_, i) => i !== index) });
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <BookTemplate size={14} /> Knowledge Base
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">THE CODEX</h2>
                    <p className="text-zinc-400 mt-2">Brand Identity & Strategic DNA Configuration.</p>
                </div>
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest transition-all ${saved ? 'bg-emerald-500 text-black' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                >
                    <Save size={16} /> {saved ? 'DNA Saved' : 'Save Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button
                    onClick={() => setActiveTab('dna')}
                    className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${activeTab === 'dna' ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                >
                    <Fingerprint size={16} className="inline mb-0.5 mr-2" /> Identity Matrix
                </button>
                <button
                    onClick={() => setActiveTab('personas')}
                    className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${activeTab === 'personas' ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                >
                    <Users size={16} className="inline mb-0.5 mr-2" /> Target Personas
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {activeTab === 'dna' && (
                    <>
                        {/* Tone Sliders */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Sliders size={14} /> Brand Voice Tuning
                            </h3>

                            {/* Formal vs Casual */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2 uppercase">
                                    <span>Formal</span>
                                    <span className="text-indigo-400">{dna.tone.formalVsCasual}% Casual</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={dna.tone.formalVsCasual}
                                    onChange={(e) => setDna({ ...dna, tone: { ...dna.tone, formalVsCasual: parseInt(e.target.value) } })}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            {/* Serious vs Playful */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2 uppercase">
                                    <span>Serious</span>
                                    <span className="text-pink-400">{dna.tone.playfulVsSerious}% Playful</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={dna.tone.playfulVsSerious}
                                    onChange={(e) => setDna({ ...dna, tone: { ...dna.tone, playfulVsSerious: parseInt(e.target.value) } })}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>

                            {/* Classic vs Modern */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2 uppercase">
                                    <span>Classic</span>
                                    <span className="text-cyan-400">{dna.tone.modernVsClassic}% Modern</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={dna.tone.modernVsClassic}
                                    onChange={(e) => setDna({ ...dna, tone: { ...dna.tone, modernVsClassic: parseInt(e.target.value) } })}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Core Values & Banned Words */}
                        <div className="space-y-8">
                            {/* Core Values */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Fingerprint size={14} /> Core Values
                                </h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addValue()}
                                        placeholder="e.g., Radical Transparency"
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-0"
                                    />
                                    <button onClick={addValue} className="bg-zinc-800 hover:bg-indigo-600 text-white p-2 rounded transition-colors">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {dna.coreValues.map((val, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-900/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold flex items-center gap-2">
                                            {val} <button onClick={() => removeValue(i)} className="hover:text-white"><X size={12} /></button>
                                        </span>
                                    ))}
                                    {dna.coreValues.length === 0 && <span className="text-zinc-600 text-xs italic">No values defined.</span>}
                                </div>
                            </div>

                            {/* Banned Words */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <ShieldBan size={14} /> Banned Vocabulary
                                </h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newBan}
                                        onChange={(e) => setNewBan(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addBan()}
                                        placeholder="e.g., Synergy, Deep Dive"
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-red-500 focus:ring-0"
                                    />
                                    <button onClick={addBan} className="bg-zinc-800 hover:bg-red-600 text-white p-2 rounded transition-colors">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {dna.bannedWords.map((val, i) => (
                                        <span key={i} className="px-3 py-1 bg-red-900/20 border border-red-500/30 rounded-full text-red-400 text-xs font-bold flex items-center gap-2">
                                            {val} <button onClick={() => removeBan(i)} className="hover:text-white"><X size={12} /></button>
                                        </span>
                                    ))}
                                    {dna.bannedWords.length === 0 && <span className="text-zinc-600 text-xs italic">No banned words.</span>}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'personas' && (
                    <div className="col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add Persona Form */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Define New Persona</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-zinc-400 font-bold block mb-1">Persona Name</label>
                                    <input
                                        type="text"
                                        value={personaName}
                                        onChange={(e) => setPersonaName(e.target.value)}
                                        placeholder="e.g., 'The Busy Founder'"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 font-bold block mb-1">Description & Needs</label>
                                    <textarea
                                        value={personaDesc}
                                        onChange={(e) => setPersonaDesc(e.target.value)}
                                        placeholder="Describe their role, goals, and struggles..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 h-32 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={addPersona}
                                    disabled={!personaName || !personaDesc}
                                    className="w-full py-2 bg-white hover:bg-indigo-500 hover:text-white text-black rounded font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    Add Persona
                                </button>
                            </div>
                        </div>

                        {/* Persona List */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dna.personas.map((p, i) => (
                                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 relative group hover:border-indigo-500/50 transition-all">
                                    <button
                                        onClick={() => removePersona(i)}
                                        className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="w-10 h-10 bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-400 mb-4">
                                        <Users size={20} />
                                    </div>
                                    <h4 className="font-bold text-white text-lg mb-2">{p.name}</h4>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{p.description}</p>
                                </div>
                            ))}
                            {dna.personas.length === 0 && (
                                <div className="col-span-2 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl p-12 text-zinc-600">
                                    <Users size={48} strokeWidth={1} className="mb-4" />
                                    <p className="font-mono text-xs uppercase tracking-widest">No Personas Defined</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};