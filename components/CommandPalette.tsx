
import React, { useState, useEffect, useRef } from 'react';
import { Search, LayoutDashboard, KanbanSquare, Swords, Eye, Flame, Power, MessageSquare, Command, ChevronRight, CornerDownLeft, NotebookPen } from 'lucide-react';
import { AgentId } from '../types';
import { AGENTS } from '../constants';

interface CommandPaletteProps {
    isOpen: boolean;
    setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    setCurrentView: (view: string) => void;
    setActiveAgent: (id: AgentId | null) => void;
    onToggleScratchpad: () => void;
}

type CommandCategory = 'NAVIGATION' | 'AGENTS' | 'SYSTEM' | 'TOOLS';

interface CommandItem {
    id: string;
    label: string;
    category: CommandCategory;
    icon: React.ReactNode;
    shortcut?: string;
    action: () => void;
    colorClass?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, setIsOpen, setCurrentView, setActiveAgent, onToggleScratchpad }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, setIsOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const closeAndExecute = (fn: () => void) => {
        setIsOpen(false);
        fn();
    };

    const commands: CommandItem[] = [
        // Tools
        {
            id: 'tool-scratchpad',
            label: 'Toggle Scratchpad',
            category: 'TOOLS',
            icon: <NotebookPen size={16} />,
            action: () => closeAndExecute(onToggleScratchpad)
        },
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Mission Control',
            category: 'NAVIGATION',
            icon: <LayoutDashboard size={16} />,
            action: () => closeAndExecute(() => { setCurrentView('dashboard'); setActiveAgent(null); })
        },
        {
            id: 'nav-roadmap',
            label: 'Tactical Roadmap',
            category: 'NAVIGATION',
            icon: <KanbanSquare size={16} />,
            action: () => closeAndExecute(() => { setCurrentView('roadmap'); setActiveAgent(null); })
        },
        {
            id: 'nav-war-room',
            label: 'The War Room',
            category: 'NAVIGATION',
            icon: <Swords size={16} />,
            action: () => closeAndExecute(() => { setCurrentView('war-room'); setActiveAgent(null); })
        },
        {
            id: 'nav-stalker',
            label: 'Competitor Stalker',
            category: 'NAVIGATION',
            icon: <Eye size={16} />,
            action: () => closeAndExecute(() => { setCurrentView('stalker'); setActiveAgent(null); })
        },
        {
            id: 'nav-incinerator',
            label: 'Idea Incinerator',
            category: 'NAVIGATION',
            icon: <Flame size={16} />,
            action: () => closeAndExecute(() => { setCurrentView('incinerator'); setActiveAgent(null); })
        },
        // Agents
        ...Object.values(AGENTS).map(agent => ({
            id: `chat-${agent.id}`,
            label: `Summon ${agent.name} (${agent.title.split('(')[0].trim()})`,
            category: 'AGENTS' as CommandCategory,
            icon: <MessageSquare size={16} />,
            colorClass: agent.color,
            action: () => closeAndExecute(() => { setCurrentView('chat'); setActiveAgent(agent.id); })
        })),
        // System
        {
            id: 'sys-reboot',
            label: 'System Reboot (Logout)',
            category: 'SYSTEM',
            icon: <Power size={16} />,
            colorClass: 'text-red-500',
            action: () => {
                if (confirm("Reboot System? This will clear your session context.")) {
                    localStorage.removeItem('solo_business_context');
                    window.location.reload();
                }
            }
        }
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );

    // Keyboard Navigation
    useEffect(() => {
        const handleNav = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                }
            }
        };

        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, filteredCommands, selectedIndex]);

    // Scroll selected into view
    useEffect(() => {
        if (listRef.current && isOpen) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start md:items-start justify-center pt-4 md:pt-[20vh] px-2 md:px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[80vh] md:h-auto md:max-h-[60vh]">
                {/* Decorative Top Border */}
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500"></div>

                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-zinc-800">
                    <Command className="text-zinc-500 mr-3" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent border-none text-lg text-white placeholder-zinc-600 focus:ring-0 font-mono"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                    />
                    <div className="hidden md:flex items-center gap-1 text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded">
                        <span>ESC</span> to close
                    </div>
                </div>

                {/* Results List */}
                <div ref={listRef} className="overflow-y-auto custom-scrollbar p-2">
                    {filteredCommands.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
                            No matching protocols found.
                        </div>
                    ) : (
                        filteredCommands.map((cmd, index) => (
                            <button
                                key={cmd.id}
                                onClick={cmd.action}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left group mb-1
                                    ${index === selectedIndex ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/50'}
                                `}
                            >
                                <div className={`p-2 rounded-md transition-colors ${index === selectedIndex ? 'bg-zinc-800 text-emerald-500' : 'bg-zinc-900 text-zinc-500'}`}>
                                    {cmd.icon}
                                </div>

                                <div className="flex-1">
                                    <span className={`text-sm font-medium ${cmd.colorClass || ''} ${index === selectedIndex ? 'text-white' : ''}`}>
                                        {cmd.label}
                                    </span>
                                </div>

                                {index === selectedIndex && (
                                    <CornerDownLeft size={16} className="text-zinc-500 animate-pulse" />
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="bg-zinc-900/50 border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                    <div className="flex gap-4">
                        <span><strong className="text-zinc-400">↑↓</strong> Navigate</span>
                        <span><strong className="text-zinc-400">↵</strong> Execute</span>
                    </div>
                    <div>
                        Neural_Link v2.0
                    </div>
                </div>
            </div>
        </div>
    );
};
