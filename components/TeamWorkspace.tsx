import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Settings, Shield, Mail, Check, X, Clock,
    Search, MoreVertical, Crown, UserPlus, Copy, Trash2,
    MessageSquare, FileText, Target, Calendar, Activity
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { soundService } from '../services/soundService';
import { showToast } from '../services/gameService';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    avatar?: string;
    status: 'active' | 'pending' | 'inactive';
    joinedAt: string;
    lastActive?: string;
}

interface Team {
    id: string;
    name: string;
    description?: string;
    members: TeamMember[];
    inviteCode: string;
    createdAt: string;
    settings: {
        allowMemberInvites: boolean;
        sharedResources: string[];
    };
}

export const TeamWorkspace: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [activeTeam, setActiveTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'overview' | 'members' | 'activity' | 'settings'>('overview');

    // Mock data for now - replace with API calls
    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        setIsLoading(true);
        try {
            // For now, load from mock - will integrate with backend later
            const mockTeam: Team = {
                id: 'team-1',
                name: 'My Startup Team',
                description: 'Building the future together',
                members: [
                    {
                        id: 'me',
                        name: 'You',
                        email: 'you@company.com',
                        role: 'owner',
                        status: 'active',
                        joinedAt: new Date().toISOString(),
                        lastActive: new Date().toISOString()
                    }
                ],
                inviteCode: 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                createdAt: new Date().toISOString(),
                settings: {
                    allowMemberInvites: true,
                    sharedResources: ['tasks', 'documents', 'reports']
                }
            };
            setTeams([mockTeam]);
            setActiveTeam(mockTeam);
        } catch (error) {
            console.error('Error loading teams:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInviteMember = async (email: string) => {
        if (!activeTeam) return;
        soundService.playClick();
        
        // Mock invite - will integrate with backend later
        const newMember: TeamMember = {
            id: `member-${Date.now()}`,
            name: email.split('@')[0],
            email,
            role: 'member',
            status: 'pending',
            joinedAt: new Date().toISOString()
        };
        
        setActiveTeam({
            ...activeTeam,
            members: [...activeTeam.members, newMember]
        });
        
        showToast('INVITE SENT', `Invitation sent to ${email}`, 'success');
        setShowInviteModal(false);
    };

    const handleCopyInviteCode = () => {
        if (!activeTeam) return;
        navigator.clipboard.writeText(activeTeam.inviteCode);
        showToast('COPIED', 'Invite code copied to clipboard', 'info');
        soundService.playClick();
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner': return 'text-yellow-500';
            case 'admin': return 'text-purple-500';
            case 'member': return 'text-emerald-500';
            default: return 'text-zinc-500';
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'owner': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
            case 'admin': return 'bg-purple-500/10 border-purple-500/20 text-purple-500';
            case 'member': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
            default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Loading team workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-emerald-500" />
                        Team Workspace
                    </h1>
                    <p className="text-zinc-500 mt-1">Collaborate with your team members</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
                    >
                        <UserPlus size={18} />
                        Invite Member
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-all"
                    >
                        <Plus size={18} />
                        New Team
                    </button>
                </div>
            </div>

            {/* Team Selector + Views */}
            {activeTeam && (
                <>
                    {/* Team Info Bar */}
                    <div className="glass-strong rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                    <span className="text-lg font-bold text-white">
                                        {activeTeam.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">{activeTeam.name}</h2>
                                    <p className="text-sm text-zinc-500">
                                        {activeTeam.members.length} members • Created {new Date(activeTeam.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white">{activeTeam.members.filter(m => m.status === 'active').length}</p>
                                    <p className="text-xs text-zinc-500">Active</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-yellow-500">{activeTeam.members.filter(m => m.status === 'pending').length}</p>
                                    <p className="text-xs text-zinc-500">Pending</p>
                                </div>
                                <button
                                    onClick={handleCopyInviteCode}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <Copy size={14} className="text-zinc-400" />
                                    <span className="text-sm font-mono text-emerald-400">{activeTeam.inviteCode}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* View Tabs */}
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        {(['overview', 'members', 'activity', 'settings'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => {setView(v); soundService.playClick();}}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                                    view === v 
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* View Content */}
                    {view === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Shared Resources Card */}
                            <div className="glass-strong rounded-xl p-5 border border-white/5">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                    <FileText size={16} className="text-emerald-500" />
                                    Shared Resources
                                </h3>
                                <div className="space-y-2">
                                    {activeTeam.settings.sharedResources.map((resource) => (
                                        <div key={resource} className="flex items-center gap-2 text-sm text-zinc-400">
                                            <Check size={14} className="text-emerald-500" />
                                            <span className="capitalize">{resource}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team Tasks Card */}
                            <div className="glass-strong rounded-xl p-5 border border-white/5">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                    <Target size={16} className="text-blue-500" />
                                    Team Tasks
                                </h3>
                                <p className="text-3xl font-bold text-white">0</p>
                                <p className="text-xs text-zinc-500 mt-1">tasks shared with team</p>
                            </div>

                            {/* Upcoming Meetings Card */}
                            <div className="glass-strong rounded-xl p-5 border border-white/5">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                    <Calendar size={16} className="text-purple-500" />
                                    Meetings
                                </h3>
                                <p className="text-zinc-500 text-sm">No upcoming meetings</p>
                            </div>
                        </div>
                    )}

                    {view === 'members' && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative max-w-md">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                                />
                            </div>

                            {/* Members List */}
                            <div className="glass-strong rounded-xl border border-white/5 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Member</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Role</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Last Active</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeTeam.members
                                            .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map((member) => (
                                            <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-white">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white flex items-center gap-2">
                                                                {member.name}
                                                                {member.role === 'owner' && <Crown size={12} className="text-yellow-500" />}
                                                            </p>
                                                            <p className="text-xs text-zinc-500">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border capitalize ${getRoleBadge(member.role)}`}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`flex items-center gap-1 text-xs ${
                                                        member.status === 'active' ? 'text-emerald-500' :
                                                        member.status === 'pending' ? 'text-yellow-500' : 'text-zinc-500'
                                                    }`}>
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            member.status === 'active' ? 'bg-emerald-500' :
                                                            member.status === 'pending' ? 'bg-yellow-500' : 'bg-zinc-500'
                                                        }`} />
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-zinc-500">
                                                    {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {member.role !== 'owner' && (
                                                        <button className="p-1 hover:bg-white/10 rounded transition-colors">
                                                            <MoreVertical size={16} className="text-zinc-500" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'activity' && (
                        <div className="glass-strong rounded-xl border border-white/5 p-8 text-center">
                            <Activity size={48} className="mx-auto text-zinc-700 mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">Activity Feed</h3>
                            <p className="text-zinc-500 text-sm">Team activity will appear here as members collaborate</p>
                        </div>
                    )}

                    {view === 'settings' && (
                        <div className="max-w-2xl space-y-6">
                            {/* General Settings */}
                            <div className="glass-strong rounded-xl border border-white/5 p-5">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                    <Settings size={16} className="text-zinc-400" />
                                    General Settings
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-2">Team Name</label>
                                        <input
                                            type="text"
                                            value={activeTeam.name}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-2">Description</label>
                                        <textarea
                                            value={activeTeam.description || ''}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/30 h-20 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="glass-strong rounded-xl border border-white/5 p-5">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                    <Shield size={16} className="text-zinc-400" />
                                    Permissions
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                        <div>
                                            <p className="text-sm text-white">Allow members to invite others</p>
                                            <p className="text-xs text-zinc-500">Members can share the invite code</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={activeTeam.settings.allowMemberInvites}
                                            className="w-5 h-5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="glass-strong rounded-xl border border-red-500/20 p-5">
                                <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-4">
                                    <Trash2 size={16} />
                                    Danger Zone
                                </h3>
                                <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 transition-all text-sm">
                                    Delete Team
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteModal
                    onInvite={handleInviteMember}
                    onClose={() => setShowInviteModal(false)}
                    inviteCode={activeTeam?.inviteCode || ''}
                    onCopyCode={handleCopyInviteCode}
                />
            )}

            {/* Create Team Modal */}
            {showCreateModal && (
                <CreateTeamModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={(name) => {
                        const newTeam: Team = {
                            id: `team-${Date.now()}`,
                            name,
                            members: [{
                                id: 'me',
                                name: 'You',
                                email: 'you@company.com',
                                role: 'owner',
                                status: 'active',
                                joinedAt: new Date().toISOString()
                            }],
                            inviteCode: 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                            createdAt: new Date().toISOString(),
                            settings: { allowMemberInvites: true, sharedResources: ['tasks', 'documents', 'reports'] }
                        };
                        setTeams([...teams, newTeam]);
                        setActiveTeam(newTeam);
                        setShowCreateModal(false);
                        showToast('TEAM CREATED', `${name} is ready to go!`, 'success');
                    }}
                />
            )}
        </div>
    );
};

// Invite Modal Component
const InviteModal: React.FC<{
    onInvite: (email: string) => void;
    onClose: () => void;
    inviteCode: string;
    onCopyCode: () => void;
}> = ({ onInvite, onClose, inviteCode, onCopyCode }) => {
    const [email, setEmail] = useState('');

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">Invite Team Member</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} className="text-zinc-400" />
                    </button>
                </div>

                {/* Email Invite */}
                <div className="mb-6">
                    <label className="text-xs text-zinc-500 block mb-2">Invite by Email</label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="teammate@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                        />
                        <button
                            onClick={() => onInvite(email)}
                            disabled={!email.includes('@')}
                            className="px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Mail size={18} />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-zinc-500">or share invite code</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Invite Code */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-xs text-zinc-500 mb-2">Share this code</p>
                    <p className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">{inviteCode}</p>
                    <button
                        onClick={onCopyCode}
                        className="mt-3 text-xs text-zinc-400 hover:text-white flex items-center gap-1 mx-auto transition-colors"
                    >
                        <Copy size={12} />
                        Copy to clipboard
                    </button>
                </div>
            </div>
        </div>
    );
};

// Create Team Modal Component
const CreateTeamModal: React.FC<{
    onClose: () => void;
    onCreate: (name: string) => void;
}> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">Create New Team</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} className="text-zinc-400" />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="text-xs text-zinc-500 block mb-2">Team Name</label>
                    <input
                        type="text"
                        placeholder="My Awesome Team"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-zinc-400 rounded-lg hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onCreate(name)}
                        disabled={!name.trim()}
                        className="flex-1 px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Team
                    </button>
                </div>
            </div>
        </div>
    );
};
