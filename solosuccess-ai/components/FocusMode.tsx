
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle2, BrainCircuit, Volume2, VolumeX, X } from 'lucide-react';
import { Task } from '../types';
import { soundService } from '../services/soundService';
import { addXP, showToast } from '../services/gameService';

interface FocusModeProps {
    activeTask: Task | null;
    onExit: () => void;
    onComplete: (taskId: string) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ activeTask, onExit, onComplete }) => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (!activeTask) return;

        // Start sound on mount
        if (soundEnabled) soundService.startFocusDrone();

        return () => {
            soundService.stopFocusDrone();
        };
    }, [activeTask]);

    useEffect(() => {
        let interval: any;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            soundService.playSuccess();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Breathing effect loop
    useEffect(() => {
        const interval = setInterval(() => setPulse(p => !p), 4000);
        return () => clearInterval(interval);
    }, []);

    const toggleTimer = () => {
        setIsActive(!isActive);
        soundService.playClick();
    };

    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        if (newState) soundService.startFocusDrone();
        else soundService.stopFocusDrone();
    };

    const handleComplete = async () => {
        if (!activeTask) return;
        soundService.stopFocusDrone();
        // Bonus XP for using Focus Mode
        const { leveledUp } = await addXP(50);
        showToast("HYPERFOCUS COMPLETE", "Neural synchronization achieved.", "xp", 50);
        if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");

        onComplete(activeTask.id);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

    if (!activeTask) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-700">

            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-black pointer-events-none transition-opacity duration-[4000ms] ${pulse ? 'opacity-50' : 'opacity-20'}`} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-4xl p-8 flex flex-col items-center text-center">

                {/* Header */}
                <div className="mb-12 animate-in slide-in-from-top-10 duration-700">
                    <div className="flex items-center justify-center gap-3 mb-4 text-emerald-500 font-mono text-sm font-bold uppercase tracking-[0.3em]">
                        <BrainCircuit size={18} className="animate-pulse" />
                        Neural Link Established
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl">
                        {activeTask.title}
                    </h1>
                    <p className="text-zinc-500 mt-4 text-lg max-w-xl mx-auto font-mono">
                        {activeTask.description.length > 100 ? activeTask.description.substring(0, 100) + '...' : activeTask.description}
                    </p>
                </div>

                {/* Timer Ring */}
                <div className="relative mb-12 group">
                    <div className={`absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl transition-all duration-[4000ms] ${pulse ? 'scale-110 opacity-40' : 'scale-90 opacity-10'}`}></div>

                    <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border-8 border-zinc-900 flex items-center justify-center relative bg-black">
                        {/* Progress Circle */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * progress) / 100}
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>

                        <div className="text-center">
                            <div className={`text-7xl md:text-8xl font-black font-mono tracking-tighter transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-emerald-500 mt-2">
                                {isActive ? 'Focus Active' : 'Session Paused'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={onExit}
                        className="p-4 rounded-full border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500 transition-all group"
                        title="Abort Session"
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl
                            ${isActive
                                ? 'bg-zinc-900 text-white border border-zinc-700 hover:border-red-500 hover:text-red-500'
                                : 'bg-white text-black hover:scale-105'
                            }`}
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <button
                        onClick={handleComplete}
                        className="p-4 rounded-full border border-zinc-800 text-emerald-500 hover:bg-emerald-900/20 hover:border-emerald-500 transition-all"
                        title="Mark Task Complete"
                    >
                        <CheckCircle2 size={24} />
                    </button>
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-8 flex gap-4">
                    <button
                        onClick={toggleSound}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all
                            ${soundEnabled ? 'border-emerald-900/50 text-emerald-500 bg-emerald-950/10' : 'border-zinc-800 text-zinc-600'}
                        `}
                    >
                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        {soundEnabled ? 'Neural Drive: ON' : 'Neural Drive: OFF'}
                    </button>
                </div>

            </div>
        </div>
    );
};
