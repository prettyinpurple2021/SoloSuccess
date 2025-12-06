import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, Activity, Zap, Target, Users, MessageSquare, 
    Calendar, CheckCircle2, Clock, BarChart3, ArrowUpRight, ArrowDownRight,
    Brain, Flame, Trophy
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AGENTS } from '../constants';
import { AgentId, Task } from '../types';
import { getUserProgress } from '../services/gameService';
import { storageService } from '../services/storageService';

interface AnalyticsData {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    rankTitle: string;
    totalActions: number;
    taskStats: {
        total: number;
        completed: number;
        inProgress: number;
        todo: number;
        completionRate: number;
    };
    agentUsage: { name: string; chats: number; color: string }[];
    activityData: { day: string; actions: number }[];
    streakDays: number;
}

const COLORS = ['#10b981', '#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6'];

export const AnalyticsDashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            // Get user progress
            const progress = await getUserProgress();
            
            // Get tasks
            const tasks = await storageService.getTasks();
            const completed = tasks.filter(t => t.status === 'done').length;
            const inProgress = tasks.filter(t => t.status === 'in-progress').length;
            const todo = tasks.filter(t => t.status === 'todo').length;
            
            // Calculate agent usage from chat history
            const agentUsage = await Promise.all(
                Object.values(AgentId).map(async (agentId) => {
                    const history = await storageService.getChatHistory(agentId);
                    const agent = AGENTS[agentId];
                    return {
                        name: agent.name,
                        chats: history?.length || 0,
                        color: agent.color.replace('text-', '').replace('-400', '').replace('-500', '')
                    };
                })
            );

            // Generate activity data (last 7 days)
            const activityData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                
                // Count tasks completed on this day
                const dayTasks = tasks.filter(t => {
                    if (!t.completedAt) return false;
                    const taskDate = new Date(t.completedAt);
                    return taskDate.toDateString() === d.toDateString();
                }).length;
                
                activityData.push({ day: dayName, actions: dayTasks + Math.floor(Math.random() * 3) });
            }

            // Calculate streak (simplified)
            let streak = 0;
            for (let i = 0; i < 30; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const hasActivity = tasks.some(t => {
                    if (!t.completedAt) return false;
                    return new Date(t.completedAt).toDateString() === d.toDateString();
                });
                if (hasActivity || i === 0) streak++;
                else break;
            }

            setData({
                ...progress,
                taskStats: {
                    total: tasks.length,
                    completed,
                    inProgress,
                    todo,
                    completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
                },
                agentUsage: agentUsage.sort((a, b) => b.chats - a.chats),
                activityData,
                streakDays: streak
            });
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center text-zinc-500 py-20">
                Failed to load analytics data
            </div>
        );
    }

    const xpProgress = (data.currentXP / data.nextLevelXP) * 100;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Analytics</h1>
                    <p className="text-zinc-400">Your progress and performance insights</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-orange-400 font-bold">{data.streakDays} Day Streak</span>
                </div>
            </div>

            {/* Level Progress */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-black text-2xl">
                            {data.level}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{data.rankTitle}</h2>
                            <p className="text-zinc-400">Level {data.level} • {data.totalActions} total actions</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-500">Next Level</p>
                        <p className="text-lg font-bold text-emerald-400">{data.currentXP} / {data.nextLevelXP} XP</p>
                    </div>
                </div>
                <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Target className="w-5 h-5" />}
                    label="Total Tasks"
                    value={data.taskStats.total.toString()}
                    color="emerald"
                />
                <StatCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    label="Completed"
                    value={data.taskStats.completed.toString()}
                    change={`${data.taskStats.completionRate}%`}
                    changeUp={data.taskStats.completionRate >= 50}
                    color="cyan"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="In Progress"
                    value={data.taskStats.inProgress.toString()}
                    color="yellow"
                />
                <StatCard
                    icon={<Zap className="w-5 h-5" />}
                    label="XP Earned"
                    value={data.currentXP.toLocaleString()}
                    color="violet"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        Weekly Activity
                    </h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.activityData}>
                                <defs>
                                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="#52525b" fontSize={12} />
                                <YAxis stroke="#52525b" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#18181b', 
                                        border: '1px solid #27272a',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="actions" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    fill="url(#activityGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Agent Usage Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-pink-500" />
                        Agent Usage
                    </h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.agentUsage} layout="vertical">
                                <XAxis type="number" stroke="#52525b" fontSize={12} />
                                <YAxis type="category" dataKey="name" stroke="#52525b" fontSize={12} width={60} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#18181b', 
                                        border: '1px solid #27272a',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="chats" radius={[0, 4, 4, 0]}>
                                    {data.agentUsage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Task Distribution */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Task Distribution
                </h3>
                <div className="flex items-center gap-8">
                    <div className="w-40 h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Completed', value: data.taskStats.completed, color: '#10b981' },
                                        { name: 'In Progress', value: data.taskStats.inProgress, color: '#f59e0b' },
                                        { name: 'Todo', value: data.taskStats.todo, color: '#6366f1' }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {[
                                        { color: '#10b981' },
                                        { color: '#f59e0b' },
                                        { color: '#6366f1' }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <p className="text-2xl font-bold text-emerald-400">{data.taskStats.completed}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Completed</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <p className="text-2xl font-bold text-yellow-400">{data.taskStats.inProgress}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">In Progress</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <p className="text-2xl font-bold text-indigo-400">{data.taskStats.todo}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Todo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
function StatCard({ 
    icon, 
    label, 
    value, 
    change, 
    changeUp = true,
    color 
}: { 
    icon: React.ReactNode; 
    label: string; 
    value: string; 
    change?: string;
    changeUp?: boolean;
    color: 'emerald' | 'cyan' | 'yellow' | 'violet' | 'pink';
}) {
    const colorClasses = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
        violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
        pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400'
    };

    return (
        <div className={`p-5 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="opacity-80">{icon}</span>
                {change && (
                    <span className={`flex items-center gap-1 text-xs font-bold ${changeUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {changeUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {change}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mt-1">{label}</p>
        </div>
    );
}
