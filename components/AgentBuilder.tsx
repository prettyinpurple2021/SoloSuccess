import React, { useState, useEffect } from 'react';
import {
    Bot, Plus, Trash2, Save, Sparkles, MessageSquare, Settings,
    Palette, Wand2, Brain, ChevronRight, Edit2, X, Copy, Check
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { showToast } from '../services/gameService';

interface CustomAgent {
    id: string;
    name: string;
    role: string;
    personality: string;
    systemPrompt: string;
    avatar: string;
    color: string;
    createdAt: string;
}

const avatarOptions = [
    '🤖', '🧠', '💡', '🎯', '⚡', '🔮', '🎨', '📊', '🚀', '💼', '🛡️', '🌟'
];

const colorOptions = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-amber-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-cyan-500 to-blue-500'
];

const personalityTemplates = [
    { id: 'friendly', name: 'Friendly Helper', prompt: 'Be warm, encouraging, and supportive. Use positive language.' },
    { id: 'professional', name: 'Professional Expert', prompt: 'Be precise, data-driven, and business-focused. Provide actionable insights.' },
    { id: 'creative', name: 'Creative Thinker', prompt: 'Think outside the box. Suggest innovative and unconventional solutions.' },
    { id: 'coach', name: 'Motivational Coach', prompt: 'Be inspiring and push the user to achieve their best. Celebrate wins.' },
    { id: 'analyst', name: 'Strategic Analyst', prompt: 'Focus on analysis, patterns, and strategic recommendations.' }
];

export const AgentBuilder: React.FC = () => {
    const [agents, setAgents] = useState<CustomAgent[]>([]);
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Builder state
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [personality, setPersonality] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = () => {
        setIsLoading(true);
        try {
            const saved = localStorage.getItem('custom_agents');
            if (saved) {
                setAgents(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading agents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAgents = (newAgents: CustomAgent[]) => {
        setAgents(newAgents);
        localStorage.setItem('custom_agents', JSON.stringify(newAgents));
    };

    const resetBuilder = () => {
        setName('');
        setRole('');
        setPersonality('');
        setSystemPrompt('');
        setSelectedAvatar(avatarOptions[0]);
        setSelectedColor(colorOptions[0]);
        setEditingAgent(null);
    };

    const handleOpenBuilder = (agent?: CustomAgent) => {
        soundService.playClick();
        if (agent) {
            setEditingAgent(agent);
            setName(agent.name);
            setRole(agent.role);
            setPersonality(agent.personality);
            setSystemPrompt(agent.systemPrompt);
            setSelectedAvatar(agent.avatar);
            setSelectedColor(agent.color);
        } else {
            resetBuilder();
        }
        setShowBuilder(true);
    };

    const handleSaveAgent = () => {
        if (!name.trim()) return;

        const agent: CustomAgent = {
            id: editingAgent?.id || `agent-${Date.now()}`,
            name,
            role,
            personality,
            systemPrompt,
            avatar: selectedAvatar,
            color: selectedColor,
            createdAt: editingAgent?.createdAt || new Date().toISOString()
        };

        let updated: CustomAgent[];
        if (editingAgent) {
            updated = agents.map(a => a.id === agent.id ? agent : a);
        } else {
            updated = [...agents, agent];
        }

        saveAgents(updated);
        setShowBuilder(false);
        resetBuilder();
        showToast(
            editingAgent ? 'AGENT UPDATED' : 'AGENT CREATED',
            `${agent.name} is ready to assist you.`,
            'success'
        );
        soundService.playSuccess();
    };

    const handleDeleteAgent = (id: string) => {
        const updated = agents.filter(a => a.id !== id);
        saveAgents(updated);
        showToast('AGENT DELETED', 'Custom agent has been removed.', 'info');
    };

    const handleApplyTemplate = (template: typeof personalityTemplates[0]) => {
        setPersonality(template.name);
        setSystemPrompt(template.prompt + (systemPrompt ? `\n\n${systemPrompt}` : ''));
        soundService.playClick();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Loading agents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-purple-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Bot size={14} /> Agent Workshop
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">AGENT BUILDER</h2>
                    <p className="text-zinc-400 mt-2">Create custom AI agents with unique personalities.</p>
                </div>
                <button
                    onClick={() => handleOpenBuilder()}
                    className="flex items-center gap-2 px-5 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                >
                    <Plus size={16} />
                    Create Agent
                </button>
            </div>

            {/* Agents Grid */}
            {agents.length === 0 ? (
                <div className="text-center py-16">
                    <Bot size={64} className="mx-auto text-zinc-800 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Custom Agents Yet</h3>
                    <p className="text-zinc-500 text-sm mb-6">Create your first custom AI agent with a unique personality.</p>
                    <button
                        onClick={() => handleOpenBuilder()}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                        + Create your first agent
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map(agent => (
                        <div
                            key={agent.id}
                            className="glass-strong rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl shadow-lg`}>
                                    {agent.avatar}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenBuilder(agent)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={14} className="text-zinc-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAgent(agent.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{agent.role}</p>
                            <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{agent.personality}</p>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-purple-500/20 transition-all">
                                <MessageSquare size={14} />
                                Chat with {agent.name.split(' ')[0]}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Builder Modal */}
            {showBuilder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Wand2 size={20} className="text-purple-400" />
                                {editingAgent ? 'Edit Agent' : 'Create New Agent'}
                            </h3>
                            <button
                                onClick={() => { setShowBuilder(false); resetBuilder(); }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-zinc-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Avatar & Color */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                                        Avatar
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {avatarOptions.map(avatar => (
                                            <button
                                                key={avatar}
                                                onClick={() => setSelectedAvatar(avatar)}
                                                className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                                                    selectedAvatar === avatar
                                                        ? 'bg-purple-500/30 border-2 border-purple-500'
                                                        : 'bg-zinc-800 border border-zinc-700 hover:border-zinc-500'
                                                }`}
                                            >
                                                {avatar}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                                        Color Theme
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} transition-all ${
                                                    selectedColor === color
                                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                                                        : 'opacity-60 hover:opacity-100'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Name & Role */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                                        Agent Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Luna"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                                        Role Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Growth Strategist"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/30"
                                    />
                                </div>
                            </div>

                            {/* Personality Templates */}
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                                    Personality Templates
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {personalityTemplates.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleApplyTemplate(template)}
                                            className="px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 hover:text-white hover:border-purple-500/50 transition-all"
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Personality Description */}
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                                    Personality Description
                                </label>
                                <input
                                    type="text"
                                    placeholder="Describe your agent's personality..."
                                    value={personality}
                                    onChange={(e) => setPersonality(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/30"
                                />
                            </div>

                            {/* System Prompt */}
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2 flex items-center gap-2">
                                    <Brain size={12} /> System Instructions
                                </label>
                                <textarea
                                    placeholder="Define how your agent should behave, respond, and assist..."
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/30 h-32 resize-none"
                                />
                            </div>

                            {/* Preview */}
                            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Preview</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedColor} flex items-center justify-center text-xl shadow-lg`}>
                                        {selectedAvatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{name || 'Agent Name'}</p>
                                        <p className="text-xs text-zinc-500">{role || 'Role'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-zinc-800 flex gap-3">
                            <button
                                onClick={() => { setShowBuilder(false); resetBuilder(); }}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-zinc-400 rounded-lg hover:bg-white/10 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAgent}
                                disabled={!name.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={16} />
                                {editingAgent ? 'Update Agent' : 'Create Agent'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
