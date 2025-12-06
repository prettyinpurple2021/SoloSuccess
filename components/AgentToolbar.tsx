import React from 'react';
import { 
    ListTodo, Calendar, AlertTriangle, 
    CalendarDays, Zap,
    Calculator, TrendingUp, DollarSign,
    Code, Bug, AlertOctagon,
    FileText, Shield, CheckCircle,
    Twitter
} from 'lucide-react';
import { AgentId, AgentTool } from '../types';
import { AGENTS } from '../constants';
import { soundService } from '../services/soundService';

interface AgentToolbarProps {
    agentId: AgentId;
    onToolAction: (tool: AgentTool, context?: string) => void;
    disabled?: boolean;
    chatContext?: string; // Last few messages for context
}

// Icon mapping for dynamic icon rendering
const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
    ListTodo,
    Calendar,
    AlertTriangle,
    Twitter,
    CalendarDays,
    Zap,
    Calculator,
    TrendingUp,
    DollarSign,
    Code,
    Bug,
    AlertOctagon,
    FileText,
    Shield,
    CheckCircle,
};

export const AgentToolbar: React.FC<AgentToolbarProps> = ({ 
    agentId, 
    onToolAction, 
    disabled = false,
    chatContext 
}) => {
    const agent = AGENTS[agentId];
    const tools = agent.tools || [];

    if (tools.length === 0) return null;

    const handleClick = (tool: AgentTool) => {
        if (disabled) return;
        soundService.playClick();
        onToolAction(tool, chatContext);
    };

    // Get agent-specific color class
    const getColorClass = () => {
        switch (agentId) {
            case AgentId.ROXY: return 'border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-400';
            case AgentId.ECHO: return 'border-pink-500/30 hover:bg-pink-500/10 hover:border-pink-500/50 text-pink-400';
            case AgentId.LEXI: return 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 text-blue-400';
            case AgentId.GLITCH: return 'border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50 text-yellow-400';
            case AgentId.LUMI: return 'border-violet-500/30 hover:bg-violet-500/10 hover:border-violet-500/50 text-violet-400';
            default: return 'border-zinc-500/30 hover:bg-zinc-500/10 text-zinc-400';
        }
    };

    return (
        <div className="flex flex-wrap gap-2 p-3 border-t border-white/10 bg-black/30">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 w-full mb-1">
                Quick Actions
            </span>
            {tools.map((tool) => {
                const IconComponent = ICON_MAP[tool.icon];
                return (
                    <button
                        key={tool.id}
                        onClick={() => handleClick(tool)}
                        disabled={disabled}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 
                            rounded-lg border text-xs font-medium
                            transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${getColorClass()}
                        `}
                        title={tool.description}
                    >
                        {IconComponent && <IconComponent size={14} />}
                        <span>{tool.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
