
import React, { useState, useEffect } from 'react';
import { X, Save, Copy, MessageSquare, Eraser, Check } from 'lucide-react';
import { soundService } from '../services/soundService';
import { showToast } from '../services/gameService';
import { AgentId } from '../types';

interface ScratchpadProps {
    isOpen: boolean;
    onClose: () => void;
    activeAgent: AgentId | null;
    onSendToAgent: (text: string) => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose, activeAgent, onSendToAgent }) => {
    const [content, setContent] = useState('');
    const [justSaved, setJustSaved] = useState(false);
    const [justCopied, setJustCopied] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('solo_scratchpad');
        if (saved) setContent(saved);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setContent(newVal);
        localStorage.setItem('solo_scratchpad', newVal);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setJustCopied(true);
        soundService.playClick();
        setTimeout(() => setJustCopied(false), 2000);
    };

    const handleClear = () => {
        if (confirm("Clear scratchpad?")) {
            setContent('');
            localStorage.removeItem('solo_scratchpad');
            soundService.playError();
        }
    };

    const handleSendToAgent = () => {
        if (!content.trim()) return;
        onSendToAgent(content);
        showToast("TRANSFERRED", "Note sent to agent uplink.", "success");
        soundService.playSuccess();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 md:bottom-8 right-0 md:right-8 z-40 w-full md:w-96 h-[50vh] md:h-96 bg-zinc-900/95 backdrop-blur-xl border-t md:border border-zinc-700 rounded-t-xl md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/50">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    Founder's Log
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClear}
                        className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors rounded hover:bg-zinc-800"
                        title="Clear"
                    >
                        <Eraser size={14} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-500 hover:text-white transition-colors rounded hover:bg-zinc-800"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Text Area */}
            <div className="flex-1 relative group">
                <textarea
                    value={content}
                    onChange={handleChange}
                    placeholder="Quick notes, ideas, or prompt drafts..."
                    className="w-full h-full bg-transparent text-zinc-300 p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar"
                    spellCheck={false}
                    autoFocus
                />
                <div className="absolute bottom-2 right-2 text-[10px] text-zinc-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {content.length} chars
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-zinc-950/50 border-t border-zinc-800 flex justify-between gap-2">
                <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors"
                >
                    {justCopied ? <Check size={14} /> : <Copy size={14} />} {justCopied ? 'Copied' : 'Copy'}
                </button>

                {activeAgent ? (
                    <button
                        onClick={handleSendToAgent}
                        disabled={!content.trim()}
                        className="flex-[2] flex items-center justify-center gap-2 px-3 py-2 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-900/50 rounded text-xs font-bold uppercase tracking-wider text-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MessageSquare size={14} /> Send to {activeAgent.toUpperCase()}
                    </button>
                ) : (
                    <div className="flex-[2] flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs font-bold uppercase tracking-wider text-zinc-600 cursor-not-allowed">
                        Open Chat to Send
                    </div>
                )}
            </div>
        </div>
    );
};
