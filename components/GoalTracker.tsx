import React, { useState, useEffect } from 'react';
import {
    Target, Plus, ChevronDown, ChevronRight, Check, Edit2, Trash2,
    TrendingUp, Clock, AlertCircle, Sparkles, Calendar, BarChart3, X
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { showToast } from '../services/gameService';
import { storageService } from '../services/storageService';

// Types
interface KeyResult {
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
}

interface Objective {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'on-track' | 'at-risk' | 'behind' | 'completed';
    keyResults: KeyResult[];
    createdAt: string;
}

export const GoalTracker: React.FC = () => {
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

    useEffect(() => {
        loadObjectives();
    }, []);

    const loadObjectives = async () => {
        setIsLoading(true);
        try {
            // Load from local storage for now
            const saved = localStorage.getItem('okr_objectives');
            if (saved) {
                setObjectives(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading objectives:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveObjectives = (newObjectives: Objective[]) => {
        setObjectives(newObjectives);
        localStorage.setItem('okr_objectives', JSON.stringify(newObjectives));
    };

    const toggleExpanded = (id: string) => {
        soundService.playClick();
        const newExpanded = new Set(expandedObjectives);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedObjectives(newExpanded);
    };

    const calculateProgress = (keyResults: KeyResult[]): number => {
        if (keyResults.length === 0) return 0;
        const totalProgress = keyResults.reduce((sum, kr) => {
            const progress = Math.min((kr.current / kr.target) * 100, 100);
            return sum + progress;
        }, 0);
        return Math.round(totalProgress / keyResults.length);
    };

    const getStatusColor = (status: Objective['status']) => {
        switch (status) {
            case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
            case 'on-track': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
            case 'at-risk': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'behind': return 'text-red-500 bg-red-500/10 border-red-500/30';
        }
    };

    const handleAddObjective = (objective: Omit<Objective, 'id' | 'createdAt'>) => {
        const newObjective: Objective = {
            ...objective,
            id: `obj-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        const updated = [...objectives, newObjective];
        saveObjectives(updated);
        setShowAddModal(false);
        showToast('OBJECTIVE ADDED', 'New goal is now being tracked.', 'success');
        soundService.playSuccess();
    };

    const handleUpdateKeyResult = (objectiveId: string, krId: string, newCurrent: number) => {
        const updated = objectives.map(obj => {
            if (obj.id !== objectiveId) return obj;
            const newKRs = obj.keyResults.map(kr => 
                kr.id === krId ? { ...kr, current: newCurrent } : kr
            );
            
            // Auto-update status based on progress
            const progress = calculateProgress(newKRs);
            let status: Objective['status'] = obj.status;
            if (progress >= 100) status = 'completed';
            else if (progress >= 70) status = 'on-track';
            else if (progress >= 40) status = 'at-risk';
            else status = 'behind';
            
            return { ...obj, keyResults: newKRs, status };
        });
        saveObjectives(updated);
    };

    const handleDeleteObjective = (id: string) => {
        const updated = objectives.filter(obj => obj.id !== id);
        saveObjectives(updated);
        showToast('DELETED', 'Objective removed.', 'info');
    };

    const overallProgress = objectives.length > 0
        ? Math.round(objectives.reduce((sum, obj) => sum + calculateProgress(obj.keyResults), 0) / objectives.length)
        : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Loading goals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Target size={14} /> OKR System
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">GOAL TRACKER</h2>
                    <p className="text-zinc-400 mt-2">Define objectives and track key results.</p>
                </div>
                <button
                    onClick={() => { setShowAddModal(true); soundService.playClick(); }}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                >
                    <Plus size={16} />
                    New Objective
                </button>
            </div>

            {/* Overall Progress Card */}
            <div className="glass-strong rounded-xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 size={16} className="text-emerald-500" />
                        Overall Progress
                    </h3>
                    <span className="text-2xl font-bold text-emerald-400">{overallProgress}%</span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-zinc-500">
                    <span>{objectives.length} objectives total</span>
                    <span>{objectives.filter(o => o.status === 'completed').length} completed</span>
                </div>
            </div>

            {/* Objectives List */}
            {objectives.length === 0 ? (
                <div className="text-center py-16">
                    <Target size={64} className="mx-auto text-zinc-800 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Objectives Yet</h3>
                    <p className="text-zinc-500 text-sm mb-6">Start by defining your first quarterly objective.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                    >
                        + Add your first objective
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {objectives.map(objective => (
                        <div
                            key={objective.id}
                            className="glass-strong rounded-xl border border-white/5 overflow-hidden"
                        >
                            {/* Objective Header */}
                            <div
                                onClick={() => toggleExpanded(objective.id)}
                                className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <button className="mt-1 text-zinc-400">
                                        {expandedObjectives.has(objective.id) 
                                            ? <ChevronDown size={20} /> 
                                            : <ChevronRight size={20} />
                                        }
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold text-white">{objective.title}</h4>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(objective.status)}`}>
                                                {objective.status.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mb-3">{objective.description}</p>
                                        
                                        {/* Mini Progress Bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all ${
                                                        objective.status === 'completed' ? 'bg-emerald-500' :
                                                        objective.status === 'on-track' ? 'bg-blue-500' :
                                                        objective.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${calculateProgress(objective.keyResults)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-400">
                                                {calculateProgress(objective.keyResults)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                                        <Calendar size={12} />
                                        {new Date(objective.dueDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Key Results */}
                            {expandedObjectives.has(objective.id) && (
                                <div className="border-t border-white/5 bg-black/20 p-5 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Key Results ({objective.keyResults.length})
                                        </h5>
                                        <button
                                            onClick={() => handleDeleteObjective(objective.id)}
                                            className="text-red-500/50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {objective.keyResults.map(kr => (
                                            <div key={kr.id} className="bg-zinc-900/50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm text-white font-medium">{kr.description}</p>
                                                    <span className="text-xs text-zinc-500">
                                                        {kr.current} / {kr.target} {kr.unit}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={kr.target}
                                                        value={kr.current}
                                                        onChange={(e) => handleUpdateKeyResult(objective.id, kr.id, parseInt(e.target.value))}
                                                        className="flex-1 h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                                    />
                                                    <span className={`text-xs font-bold ${kr.current >= kr.target ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                                        {Math.round((kr.current / kr.target) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <ObjectiveModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddObjective}
                />
            )}
        </div>
    );
};

// Modal Component
const ObjectiveModal: React.FC<{
    onClose: () => void;
    onSave: (objective: Omit<Objective, 'id' | 'createdAt'>) => void;
    initialData?: Objective;
}> = ({ onClose, onSave, initialData }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [dueDate, setDueDate] = useState(initialData?.dueDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [keyResults, setKeyResults] = useState<KeyResult[]>(initialData?.keyResults || [
        { id: 'kr-1', description: '', target: 100, current: 0, unit: '%' }
    ]);

    const addKeyResult = () => {
        setKeyResults([...keyResults, {
            id: `kr-${Date.now()}`,
            description: '',
            target: 100,
            current: 0,
            unit: '%'
        }]);
    };

    const updateKeyResult = (id: string, field: keyof KeyResult, value: any) => {
        setKeyResults(keyResults.map(kr => 
            kr.id === id ? { ...kr, [field]: value } : kr
        ));
    };

    const removeKeyResult = (id: string) => {
        if (keyResults.length > 1) {
            setKeyResults(keyResults.filter(kr => kr.id !== id));
        }
    };

    const handleSubmit = () => {
        if (!title.trim()) return;
        
        onSave({
            title,
            description,
            dueDate,
            status: 'on-track',
            keyResults: keyResults.filter(kr => kr.description.trim())
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h3 className="text-lg font-bold text-white">
                        {initialData ? 'Edit Objective' : 'New Objective'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} className="text-zinc-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Objective */}
                    <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                            Objective Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Increase customer acquisition"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                            Description
                        </label>
                        <textarea
                            placeholder="What do you want to achieve?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 h-20 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                            Target Date
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/30"
                        />
                    </div>

                    {/* Key Results */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs text-zinc-500 uppercase tracking-wider">
                                Key Results
                            </label>
                            <button
                                onClick={addKeyResult}
                                className="text-xs text-emerald-400 hover:text-emerald-300"
                            >
                                + Add Key Result
                            </button>
                        </div>
                        <div className="space-y-3">
                            {keyResults.map((kr, index) => (
                                <div key={kr.id} className="flex gap-2 items-start">
                                    <span className="text-xs text-zinc-600 mt-3">{index + 1}.</span>
                                    <input
                                        type="text"
                                        placeholder="e.g., Acquire 1000 new users"
                                        value={kr.description}
                                        onChange={(e) => updateKeyResult(kr.id, 'description', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Target"
                                        value={kr.target}
                                        onChange={(e) => updateKeyResult(kr.id, 'target', parseInt(e.target.value) || 0)}
                                        className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/30"
                                    />
                                    <select
                                        value={kr.unit}
                                        onChange={(e) => updateKeyResult(kr.id, 'unit', e.target.value)}
                                        className="w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                                    >
                                        <option value="%">%</option>
                                        <option value="users">users</option>
                                        <option value="$">$</option>
                                        <option value="items">items</option>
                                        <option value="hrs">hrs</option>
                                    </select>
                                    {keyResults.length > 1 && (
                                        <button
                                            onClick={() => removeKeyResult(kr.id)}
                                            className="p-2 text-red-500/50 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-zinc-400 rounded-lg hover:bg-white/10 transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="flex-1 px-4 py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {initialData ? 'Update Objective' : 'Create Objective'}
                    </button>
                </div>
            </div>
        </div>
    );
};
