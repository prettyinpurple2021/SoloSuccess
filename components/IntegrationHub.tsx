import React, { useState } from 'react';
import {
    Plug2, Key, Copy, Check, ExternalLink, Slack, FileText,
    Code2, Zap, Shield, Settings, RefreshCw, ChevronRight, X
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { showToast } from '../services/gameService';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'productivity' | 'communication' | 'storage' | 'automation';
    status: 'connected' | 'available' | 'coming_soon';
    color: string;
}

const integrations: Integration[] = [
    {
        id: 'slack',
        name: 'Slack',
        description: 'Get notifications and send messages directly to your Slack channels.',
        icon: <Slack size={24} />,
        category: 'communication',
        status: 'available',
        color: 'text-purple-400'
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Sync tasks and documents with your Notion workspace.',
        icon: <FileText size={24} />,
        category: 'productivity',
        status: 'available',
        color: 'text-white'
    },
    {
        id: 'zapier',
        name: 'Zapier',
        description: 'Connect to 5000+ apps with automated workflows.',
        icon: <Zap size={24} />,
        category: 'automation',
        status: 'coming_soon',
        color: 'text-orange-400'
    },
    {
        id: 'webhooks',
        name: 'Webhooks',
        description: 'Receive real-time events for custom integrations.',
        icon: <RefreshCw size={24} />,
        category: 'automation',
        status: 'available',
        color: 'text-emerald-400'
    }
];

const apiEndpoints = [
    { method: 'GET', path: '/api/v1/tasks', description: 'List all tasks' },
    { method: 'POST', path: '/api/v1/tasks', description: 'Create a new task' },
    { method: 'GET', path: '/api/v1/competitors', description: 'Get competitor reports' },
    { method: 'GET', path: '/api/v1/context', description: 'Get business context' },
    { method: 'POST', path: '/api/v1/ai/generate', description: 'Generate AI content' },
    { method: 'GET', path: '/api/v1/goals', description: 'List OKR objectives' }
];

export const IntegrationHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'integrations' | 'api'>('integrations');
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState<Integration | null>(null);

    const generateApiKey = () => {
        soundService.playClick();
        const key = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        setApiKey(key);
        localStorage.setItem('api_key', key);
        showToast('API KEY GENERATED', 'Your new API key is ready.', 'success');
        soundService.playSuccess();
    };

    const copyApiKey = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const handleConnect = (integration: Integration) => {
        if (integration.status === 'coming_soon') {
            showToast('COMING SOON', `${integration.name} integration will be available soon.`, 'info');
            return;
        }
        setShowConnectModal(integration);
        soundService.playClick();
    };

    const methodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'text-emerald-400 bg-emerald-500/10';
            case 'POST': return 'text-blue-400 bg-blue-500/10';
            case 'PUT': return 'text-amber-400 bg-amber-500/10';
            case 'DELETE': return 'text-red-400 bg-red-500/10';
            default: return 'text-zinc-400 bg-zinc-500/10';
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Plug2 size={14} /> Developer Portal
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">INTEGRATION HUB</h2>
                    <p className="text-zinc-400 mt-2">Connect your workflows and access the API.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-800">
                <button
                    onClick={() => { setActiveTab('integrations'); soundService.playClick(); }}
                    className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                        activeTab === 'integrations'
                            ? 'border-cyan-500 text-cyan-400'
                            : 'border-transparent text-zinc-500 hover:text-white'
                    }`}
                >
                    <Plug2 size={16} className="inline mr-2" />
                    Integrations
                </button>
                <button
                    onClick={() => { setActiveTab('api'); soundService.playClick(); }}
                    className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                        activeTab === 'api'
                            ? 'border-cyan-500 text-cyan-400'
                            : 'border-transparent text-zinc-500 hover:text-white'
                    }`}
                >
                    <Code2 size={16} className="inline mr-2" />
                    API Access
                </button>
            </div>

            {/* Content */}
            {activeTab === 'integrations' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((integration) => (
                        <div
                            key={integration.id}
                            className={`glass-strong rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all ${
                                integration.status === 'coming_soon' ? 'opacity-60' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-white/5 ${integration.color}`}>
                                    {integration.icon}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                                    integration.status === 'connected'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : integration.status === 'available'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-zinc-700 text-zinc-400'
                                }`}>
                                    {integration.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{integration.name}</h3>
                            <p className="text-sm text-zinc-400 mb-4">{integration.description}</p>
                            <button
                                onClick={() => handleConnect(integration)}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                                    integration.status === 'connected'
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                        : integration.status === 'available'
                                        ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                                        : 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed'
                                }`}
                            >
                                {integration.status === 'connected' ? (
                                    <>
                                        <Check size={14} /> Connected
                                    </>
                                ) : integration.status === 'available' ? (
                                    <>
                                        <Plug2 size={14} /> Connect
                                    </>
                                ) : (
                                    'Coming Soon'
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* API Key Section */}
                    <div className="glass-strong rounded-xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Key size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">API Key</h3>
                                <p className="text-xs text-zinc-500">Use this key to authenticate API requests</p>
                            </div>
                        </div>

                        {apiKey ? (
                            <div className="flex gap-2">
                                <code className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-sm text-zinc-300 font-mono truncate">
                                    {apiKey}
                                </code>
                                <button
                                    onClick={copyApiKey}
                                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                                >
                                    {copiedKey ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-zinc-400" />}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={generateApiKey}
                                className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg font-bold text-sm transition-all"
                            >
                                <Key size={16} />
                                Generate API Key
                            </button>
                        )}

                        <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-500">
                            <Shield size={12} />
                            <span>Keep your API key secret. Do not share it in public repositories.</span>
                        </div>
                    </div>

                    {/* API Endpoints */}
                    <div className="glass-strong rounded-xl p-6 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Code2 size={18} className="text-cyan-400" />
                                API Endpoints
                            </h3>
                            <a
                                href="#"
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                                Full Documentation <ExternalLink size={12} />
                            </a>
                        </div>

                        <div className="space-y-2">
                            {apiEndpoints.map((endpoint, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-3 bg-black/20 rounded-lg hover:bg-black/40 transition-colors"
                                >
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded ${methodColor(endpoint.method)}`}>
                                        {endpoint.method}
                                    </span>
                                    <code className="flex-1 text-sm font-mono text-zinc-300">{endpoint.path}</code>
                                    <span className="text-xs text-zinc-500 hidden md:block">{endpoint.description}</span>
                                    <ChevronRight size={14} className="text-zinc-600" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                            <p className="text-xs text-zinc-400 mb-2">Example Request:</p>
                            <pre className="text-xs text-cyan-400 font-mono overflow-x-auto">
{`curl -X GET \\
  https://api.solosuccess.ai/v1/tasks \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Connect Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className={showConnectModal.color}>{showConnectModal.icon}</span>
                                Connect {showConnectModal.name}
                            </h3>
                            <button
                                onClick={() => setShowConnectModal(null)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-zinc-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-zinc-400">{showConnectModal.description}</p>
                            
                            {showConnectModal.id === 'webhooks' ? (
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                                        Webhook URL
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://your-server.com/webhook"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/30"
                                    />
                                </div>
                            ) : (
                                <button
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-bold rounded-lg"
                                >
                                    <ExternalLink size={16} />
                                    Sign in with {showConnectModal.name}
                                </button>
                            )}
                        </div>
                        <div className="p-6 border-t border-zinc-800 flex gap-3">
                            <button
                                onClick={() => setShowConnectModal(null)}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-zinc-400 rounded-lg hover:bg-white/10 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    showToast('CONNECTED', `${showConnectModal.name} is now connected.`, 'success');
                                    soundService.playSuccess();
                                    setShowConnectModal(null);
                                }}
                                className="flex-1 px-4 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-all"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
