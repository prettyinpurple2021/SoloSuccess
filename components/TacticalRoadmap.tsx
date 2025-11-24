
import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle2, Circle, AlertCircle, Calendar, ArrowRight, Loader2, Trash2, PlayCircle, Zap, Target } from 'lucide-react';
import { generateTacticalPlan } from '../services/geminiService';
import { Task, TaskStatus, AgentId } from '../types';
import { AGENTS } from '../constants';
import { addXP, showToast } from '../services/gameService';
import { storageService } from '../services/storageService';

interface TaskCardProps {
    task: Task;
    onMove: (id: string, status: TaskStatus) => void;
    onDelete: (id: string) => void;
    onFocus: (task: Task) => void;
}

const getAgentColor = (id: AgentId) => {
    switch (id) {
        case AgentId.ROXY: return 'border-emerald-500/50 text-emerald-400';
        case AgentId.ECHO: return 'border-pink-500/50 text-pink-400';
        case AgentId.LEXI: return 'border-blue-500/50 text-blue-400';
        case AgentId.GLITCH: return 'border-yellow-500/50 text-yellow-400';
        default: return 'border-zinc-500 text-zinc-400';
    }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onMove, onDelete, onFocus }) => {
    const agent = AGENTS[task.assignee];
    const agentStyle = getAgentColor(task.assignee);

    return (
        <div className="glass-card p-3 md:p-5 rounded-xl group hover:border-emerald-500/30 transition-all shadow-lg hover:shadow-xl relative animate-in fade-in zoom-in duration-300 flex flex-col touch-none">

            <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${agentStyle} bg-black/40 backdrop-blur-sm`}>
                    {agent.name}
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                    task.priority === 'medium' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                    }`} title={`Priority: ${task.priority}`} />
            </div>

            <h4 className="text-sm font-bold text-white mb-1 md:mb-2 leading-tight group-hover:text-emerald-400 transition-colors">{task.title}</h4>
            <p className="text-xs text-zinc-400 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 flex-1">{task.description}</p>

            <div className="flex items-center justify-between mt-auto pt-2 md:pt-3 border-t border-white/5 gap-2">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono shrink-0">
                    <Clock size={10} /> <span className="hidden sm:inline">{task.estimatedTime}</span>
                </div>

                <div className="flex gap-0.5 md:gap-1 flex-wrap justify-end">
                    {/* Focus Button */}
                    {task.status !== 'done' && (
                        <button
                            onClick={() => onFocus(task)}
                            className="p-1.5 md:p-2 hover:bg-indigo-500/20 rounded text-indigo-400 transition-colors touch-target"
                            title="Enter Focus Mode"
                            aria-label="Enter focus mode"
                        >
                            <Target size={12} className="md:hidden" />
                            <Target size={14} className="hidden md:inline" />
                        </button>
                    )}

                    <div className="w-px h-4 bg-white/10 mx-0.5 md:mx-1 self-center" />

                    {task.status !== 'todo' && (
                        <button onClick={() => onMove(task.id, 'todo')} className="p-1.5 md:p-2 hover:bg-white/10 rounded text-zinc-400 transition-colors touch-target" title="Move to Todo" aria-label="Move to todo">
                            <Circle size={12} />
                        </button>
                    )}
                    {task.status !== 'in_progress' && (
                        <button onClick={() => onMove(task.id, 'in_progress')} className="p-1.5 md:p-2 hover:bg-amber-500/20 rounded text-amber-400 transition-colors touch-target" title="Move to In Progress" aria-label="Move to in progress">
                            <PlayCircle size={12} />
                        </button>
                    )}
                    {task.status !== 'done' && (
                        <button onClick={() => onMove(task.id, 'done')} className="p-1.5 md:p-2 hover:bg-emerald-500/20 rounded text-emerald-400 transition-colors touch-target" title="Complete" aria-label="Mark as complete">
                            <CheckCircle2 size={12} />
                        </button>
                    )}
                    <button onClick={() => onDelete(task.id)} className="p-1.5 md:p-2 hover:bg-red-500/20 rounded text-red-500 transition-colors touch-target" title="Delete" aria-label="Delete task">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface TacticalRoadmapProps {
    onEnterFocusMode?: (task: Task) => void;
}

export const TacticalRoadmap: React.FC<TacticalRoadmapProps> = ({ onEnterFocusMode }) => {
    const [goal, setGoal] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterAgent, setFilterAgent] = useState<AgentId | 'ALL'>('ALL');

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const loaded = await storageService.getTasks();
                setTasks(loaded);
            } catch (e) {
                console.error("Failed to load tasks", e);
            }
        };
        loadTasks();
    }, []);

    const handleGenerate = async () => {
        if (!goal.trim()) return;
        setLoading(true);
        const generatedTasks = await generateTacticalPlan(goal);
        if (generatedTasks) {
            await storageService.saveTasks(generatedTasks);
            setTasks(prev => [...prev, ...generatedTasks]);
            setGoal('');
            // Gamification
            const { leveledUp } = await addXP(10);
            showToast("PLAN GENERATED", "Tactical plan created successfully.", "xp", 10);
            if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
        }
        setLoading(false);
    };

    const moveTask = async (taskId: string, newStatus: TaskStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // If moving to done, set completedAt.
        const updatedTask = {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'done' ? new Date().toISOString() : undefined
        };

        const updated = tasks.map(t => t.id === taskId ? updatedTask : t);
        setTasks(updated);
        await storageService.updateTask(taskId, { status: newStatus, completedAt: updatedTask.completedAt });

        // Gamification: Award XP on completion
        if (newStatus === 'done' && task.status !== 'done') {
            const { leveledUp } = await addXP(150);
            showToast("TASK COMPLETE", "Operational objective achieved.", "xp", 150);
            if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
        }
    };

    const deleteTask = async (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        await storageService.deleteTask(taskId);
    };

    const clearBoard = async () => {
        if (confirm("Are you sure you want to clear all tasks?")) {
            setTasks([]);
            await storageService.clearTasks();
        }
    };

    const handleFocus = (task: Task) => {
        if (onEnterFocusMode) {
            onEnterFocusMode(task);
        }
    };

    const Column = ({ title, status, icon }: { title: string, status: TaskStatus, icon: React.ReactNode }) => {
        const colTasks = tasks.filter(t => t.status === status && (filterAgent === 'ALL' || t.assignee === filterAgent));

        return (
            <div className="flex-1 md:min-w-[280px] lg:min-w-[300px] flex flex-col glass-panel rounded-xl p-3 md:p-4 h-full md:h-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
                <div className="flex items-center justify-between mb-3 md:mb-4 pb-2 border-b border-white/5 shrink-0">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        {icon} <span className="hidden sm:inline">{title}</span>
                    </h3>
                    <span className="bg-white/10 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/5">
                        {colTasks.length}
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 custom-scrollbar pr-1 momentum-scroll">
                    {colTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onMove={moveTask}
                            onDelete={deleteTask}
                            onFocus={handleFocus}
                        />
                    ))}
                    {colTasks.length === 0 && (
                        <div className="h-20 md:h-24 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-zinc-600 text-xs uppercase tracking-widest bg-white/5">
                            <span className="hidden sm:inline">No Tasks</span>
                            <span className="sm:hidden">Empty</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-auto md:h-[85vh] flex flex-col">
            {/* Header */}
            <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase drop-shadow-glow">Tactical Roadmap</h2>
                    <p className="text-zinc-400 text-xs md:text-sm truncate"><span className="hidden md:inline">Operational Execution Board // Overseer: ROXY</span><span className="md:hidden">Execution Board</span></p>
                </div>
                <div className="flex gap-2">
                    {tasks.length > 0 && (
                        <button onClick={clearBoard} className="px-3 md:px-4 py-2 text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded transition-colors uppercase tracking-wider hover:border-red-500/40 touch-target">
                            <span className="hidden sm:inline">Clear Board</span>
                            <span className="sm:hidden">Clear</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Goal Input */}
            <div className="glass-panel p-2 rounded-xl mb-4 md:mb-8 flex flex-col md:flex-row gap-2 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex-1 relative z-10">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
                        <Plus size={16} className="md:hidden" />
                        <Plus size={18} className="hidden md:inline" />
                    </div>
                    <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        placeholder="Enter a high-level goal (e.g., 'Plan a viral TikTok campaign for Q3')"
                        className="w-full bg-transparent border-none pl-9 md:pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white focus:ring-0 placeholder-zinc-600 font-medium"
                        disabled={loading}
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading || !goal.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10 touch-target w-full md:w-auto"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><span className="hidden sm:inline">Generate Plan</span><span className="sm:hidden">Generate</span></>}
                </button>
            </div>

            {/* Agent Filters */}
            <div className="mb-4 md:mb-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <div className="flex flex-nowrap md:flex-wrap gap-2">
                    <button
                        onClick={() => setFilterAgent('ALL')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterAgent === 'ALL'
                            ? 'bg-white text-black shadow-glow'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        All Agents
                    </button>
                    {Object.values(AGENTS).map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => setFilterAgent(agent.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${filterAgent === agent.id
                                ? `bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-glow`
                                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${filterAgent === agent.id ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                            {agent.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-auto md:overflow-y-hidden scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 h-auto md:h-full md:min-w-0">
                    <Column title="Pending Intel" status="todo" icon={<Circle size={14} className="text-zinc-500" />} />
                    <Column title="Active Ops" status="in_progress" icon={<Loader2 size={14} className="text-amber-500 animate-spin-slow" />} />
                    <Column title="Mission Complete" status="done" icon={<CheckCircle2 size={14} className="text-emerald-500" />} />
                </div>
            </div>

        </div >
    );
};
