import React, { useState, useEffect } from 'react';
import { Terminal, ArrowRight, Check } from 'lucide-react';
import { BusinessContext } from '../types';
import { storageService } from '../services/storageService';

interface SystemBootProps {
    onComplete: () => void;
}

export const SystemBoot: React.FC<SystemBootProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [bootLogs, setBootLogs] = useState<string[]>([]);
    const [formData, setFormData] = useState<BusinessContext>({
        founderName: '',
        companyName: '',
        industry: '',
        description: ''
    });
    const [activeField, setActiveField] = useState<keyof BusinessContext>('founderName');

    useEffect(() => {
        // Initial Boot Sequence Simulation
        const logs = [
            "SOLO_SUCCESS_AI BIOS V1.0.5",
            "CHECKING_MEMORY... OK",
            "LOADING_NEURAL_ENGINE... OK",
            "INITIALIZING_AGENTS... [ROXY, ECHO, LEXI, GLITCH]... ONLINE",
            "MOUNTING_DRIVE... OK",
            "CONNECTING_SECURE_LAYER... ESTABLISHED"
        ];

        let delay = 0;
        logs.forEach((log, i) => {
            delay += Math.random() * 500 + 200;
            setTimeout(() => {
                setBootLogs(prev => [...prev, log]);
                if (i === logs.length - 1) {
                    setTimeout(() => setStep(1), 800);
                }
            }, delay);
        });
    }, []);

    const handleNext = async () => {
        const value = formData[activeField];
        if (typeof value !== 'string' || !value.trim()) return;

        if (activeField === 'founderName') setActiveField('companyName');
        else if (activeField === 'companyName') setActiveField('industry');
        else if (activeField === 'industry') setActiveField('description');
        else {
            setStep(2); // Success animation
            setTimeout(onComplete, 2000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleNext();
    };

    if (step === 0) {
        return (
            <div className="h-screen bg-black text-emerald-500 font-mono p-8 flex flex-col justify-end pb-20">
                {bootLogs.map((log, i) => (
                    <div key={i} className="mb-1 text-sm opacity-80">{log}</div>
                ))}
                <div className="animate-pulse">_</div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 border-4 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <Check size={48} className="text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">SYSTEM INITIALIZED</h1>
                    <p className="text-emerald-500 font-mono">WELCOME TO MISSION CONTROL, {formData.founderName.toUpperCase()}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-12 border-b border-zinc-800 pb-4 flex items-center gap-3">
                    <Terminal className="text-emerald-500" />
                    <h2 className="text-xl text-white font-bold tracking-widest uppercase">Config.sys Setup</h2>
                </div>

                <div className="space-y-12">
                    {/* Question Block */}
                    <div className="space-y-4">
                        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                            {activeField === 'founderName' && "User Identity:"}
                            {activeField === 'companyName' && "Entity Name:"}
                            {activeField === 'industry' && "Sector:"}
                            {activeField === 'description' && "Mission Parameters:"}
                        </p>
                        <h1 className="text-3xl md:text-5xl font-black text-white">
                            {activeField === 'founderName' && "What is your name?"}
                            {activeField === 'companyName' && "What is your company called?"}
                            {activeField === 'industry' && "What industry are you in?"}
                            {activeField === 'description' && "Describe your business in one sentence."}
                        </h1>
                        <input
                            autoFocus
                            type="text"
                            value={formData[activeField]}
                            onChange={(e) => setFormData({ ...formData, [activeField]: e.target.value })}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent border-b-2 border-zinc-700 text-2xl md:text-4xl py-4 text-emerald-500 focus:border-emerald-500 focus:outline-none font-mono"
                            placeholder="TYPE_HERE..."
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            {['founderName', 'companyName', 'industry', 'description'].map((f, i) => (
                                <div key={i} className={`h-1 w-8 rounded ${Object.keys(formData).indexOf(activeField) >= i ? 'bg-emerald-500' : 'bg-zinc-800'
                                    }`} />
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-bold hover:bg-emerald-400 transition-colors"
                        >
                            {activeField === 'description' ? 'INITIALIZE SYSTEM' : 'NEXT'} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};