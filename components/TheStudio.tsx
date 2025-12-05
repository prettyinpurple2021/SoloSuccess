import React, { useState, useEffect } from 'react';
import { Paintbrush, Image as ImageIcon, Loader2, Download, Sparkles, Palette, Layers, Save, Type, Trash2, Copy, Grid, X } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';
import { CreativeAsset } from '../types';

const STYLES = [
    { id: 'cyberpunk', label: 'Cyberpunk / High Tech', desc: 'Neon, dark, futuristic, glowing' },
    { id: 'minimal', label: 'Minimalist / SaaS', desc: 'Clean lines, whitespace, flat colors' },
    { id: 'cinematic', label: 'Cinematic / Dramatic', desc: 'High contrast, moody lighting, realistic' },
    { id: 'sketch', label: 'Hand-Drawn / Sketch', desc: 'Artistic, rough lines, human touch' },
    { id: 'corporate', label: 'Corporate / Professional', desc: 'Safe, blue tones, stock photo vibe' }
];

const COPY_TYPES = [
    { id: 'slogan', label: 'Slogan / Tagline', prompt: 'Write 5 catchy, memorable slogans for:' },
    { id: 'ad_copy', label: 'Facebook/Instagram Ad', prompt: 'Write a high-converting Facebook ad copy (Hook, Body, CTA) for:' },
    { id: 'linkedin', label: 'LinkedIn Post', prompt: 'Write a professional, thought-leadership LinkedIn post about:' },
    { id: 'email', label: 'Cold Email', prompt: 'Write a short, punchy cold email to a potential client about:' },
    { id: 'tweet', label: 'Twitter Thread', prompt: 'Write a viral Twitter thread (5 tweets) about:' }
];

export const TheStudio: React.FC = () => {
    const [mode, setMode] = useState<'visual' | 'copy'>('visual');
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
    const [selectedCopyType, setSelectedCopyType] = useState(COPY_TYPES[0]);
    
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<CreativeAsset[]>([]);
    const [showGallery, setShowGallery] = useState(true);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        const loaded = await storageService.getCreativeAssets();
        setAssets(loaded);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setGeneratedImage(null);
        setGeneratedCopy(null);
        soundService.playClick();

        try {
            if (mode === 'visual') {
                const result = await geminiService.generateBrandImage(prompt, selectedStyle.desc);
                if (result) {
                    setGeneratedImage(result);
                    await saveAsset(result, 'image');
                    soundService.playSuccess();
                } else {
                    throw new Error("Image generation failed");
                }
            } else {
                const fullPrompt = `${selectedCopyType.prompt} ${prompt}. Tone: Professional, Persuasive.`;
                const result = await geminiService.generateContent(fullPrompt);
                if (result && result.text) {
                    setGeneratedCopy(result.text);
                    await saveAsset(result.text, 'copy');
                    soundService.playSuccess();
                } else {
                    throw new Error("Copy generation failed");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("GENERATION FAILED", "Could not create asset.", "error");
            soundService.playError();
        } finally {
            setLoading(false);
        }
    };

    const saveAsset = async (content: string, type: 'image' | 'copy') => {
        const newAsset: CreativeAsset = {
            id: `${type}-${Date.now()}`,
            title: prompt.substring(0, 30) + (prompt.length > 30 ? '...' : ''),
            prompt: prompt,
            style: mode === 'visual' ? selectedStyle.label : selectedCopyType.label,
            content: content,
            type: type,
            generatedAt: new Date().toISOString()
        };

        await storageService.saveCreativeAsset(newAsset);
        await loadAssets(); // Refresh gallery
        
        const { leveledUp } = await addXP(50);
        showToast("ASSET SAVED", "Added to your creative library.", "xp", 50);
        if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this asset?')) {
            await storageService.deleteCreativeAsset(id);
            await loadAssets();
            showToast("DELETED", "Asset removed.", "info");
        }
    };

    const handleDownloadImage = (imageBase64: string) => {
        const a = document.createElement('a');
        a.href = imageBase64;
        a.download = `solo_studio_asset_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("DOWNLOADING", "Image saved to device.", "info");
    };

    const handleCopyText = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("COPIED", "Text copied to clipboard.", "success");
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-pink-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Palette size={14} /> Creative Suite
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">THE STUDIO</h2>
                    <p className="text-zinc-400 mt-2">Generative branding and marketing asset forge.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setMode('visual')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${mode === 'visual' ? 'bg-pink-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                        <ImageIcon size={16} /> Visual Studio
                    </button>
                    <button 
                        onClick={() => setMode('copy')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${mode === 'copy' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                        <Type size={16} /> Copy Lab
                    </button>
                    <button 
                        onClick={() => setShowGallery(!showGallery)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${showGallery ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                        <Grid size={16} /> {showGallery ? 'Hide Gallery' : 'Show Gallery'}
                    </button>
                </div>
            </div>

            <div className="flex gap-6 h-full items-start">
                
                {/* Main Creation Area */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Layers size={14} /> {mode === 'visual' ? 'Visual Style' : 'Copy Format'}
                            </h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {mode === 'visual' ? (
                                    STYLES.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setSelectedStyle(style)}
                                            className={`w-full p-3 rounded text-left border transition-all flex items-center justify-between group
                                                ${selectedStyle.id === style.id
                                                    ? 'bg-pink-900/20 border-pink-500/50'
                                                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'}
                                            `}
                                        >
                                            <div>
                                                <div className={`text-sm font-bold ${selectedStyle.id === style.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                                    {style.label}
                                                </div>
                                                <div className="text-[10px] text-zinc-600 font-mono">{style.desc}</div>
                                            </div>
                                            {selectedStyle.id === style.id && <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />}
                                        </button>
                                    ))
                                ) : (
                                    COPY_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedCopyType(type)}
                                            className={`w-full p-3 rounded text-left border transition-all flex items-center justify-between group
                                                ${selectedCopyType.id === type.id
                                                    ? 'bg-purple-900/20 border-purple-500/50'
                                                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'}
                                            `}
                                        >
                                            <div>
                                                <div className={`text-sm font-bold ${selectedCopyType.id === type.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                                    {type.label}
                                                </div>
                                            </div>
                                            {selectedCopyType.id === type.id && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles size={14} /> Prompt
                            </h3>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={mode === 'visual' 
                                    ? "Describe the image you need (e.g., 'A sleek modern logo for a coffee startup')..." 
                                    : "Describe the topic or product (e.g., 'A new AI-powered coffee machine')..."}
                                className="w-full h-32 bg-black border border-zinc-700 rounded p-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-none font-mono text-sm"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
                            className={`w-full py-4 bg-gradient-to-r text-white rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                                ${mode === 'visual' 
                                    ? 'from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-pink-900/20' 
                                    : 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/20'}
                            `}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Paintbrush size={18} /> Generate {mode === 'visual' ? 'Visual' : 'Copy'}</>}
                        </button>
                    </div>

                    {/* Canvas / Result */}
                    <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col relative min-h-[600px]">
                        {/* Canvas Background Grid */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                        {!generatedImage && !generatedCopy && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
                                {mode === 'visual' ? <ImageIcon size={64} strokeWidth={1} /> : <Type size={64} strokeWidth={1} />}
                                <p className="mt-4 font-mono uppercase tracking-widest text-sm">Canvas Empty</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-pink-500">
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 border-4 border-pink-900/30 rounded-full animate-spin-slow"></div>
                                    <div className="absolute inset-0 border-t-4 border-pink-500 rounded-full animate-spin"></div>
                                </div>
                                <div className="font-mono text-xs uppercase tracking-widest space-y-2 text-center">
                                    <p className="animate-pulse">Synthesizing {mode === 'visual' ? 'Visuals' : 'Copy'}...</p>
                                    <p className="text-zinc-600">Applying {mode === 'visual' ? selectedStyle.id : selectedCopyType.id} Parameters...</p>
                                </div>
                            </div>
                        )}

                        {generatedImage && mode === 'visual' && (
                            <div className="relative flex-1 flex items-center justify-center p-8 animate-in zoom-in duration-500">
                                <img
                                    src={generatedImage}
                                    alt="Generated Asset"
                                    className="max-w-full max-h-full rounded-lg shadow-2xl border border-zinc-700"
                                />
                                <div className="absolute bottom-4 right-4">
                                    <button
                                        onClick={() => handleDownloadImage(generatedImage)}
                                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-white hover:text-black text-white border border-zinc-700 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
                                    >
                                        <Download size={16} /> Download
                                    </button>
                                </div>
                            </div>
                        )}

                        {generatedCopy && mode === 'copy' && (
                            <div className="relative flex-1 p-8 animate-in fade-in duration-500 overflow-y-auto">
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                                    {generatedCopy}
                                </div>
                                <div className="absolute bottom-8 right-8">
                                    <button
                                        onClick={() => handleCopyText(generatedCopy)}
                                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-white hover:text-black text-white border border-zinc-700 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
                                    >
                                        <Copy size={16} /> Copy to Clipboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gallery Sidebar */}
                {showGallery && (
                    <div className="w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col h-[calc(100vh-12rem)] animate-in slide-in-from-right duration-300">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>Library ({assets.length})</span>
                            <button onClick={() => setShowGallery(false)} className="md:hidden"><X size={14}/></button>
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {assets.length === 0 ? (
                                <div className="text-center py-10 text-zinc-600 text-xs">
                                    No assets yet.
                                </div>
                            ) : (
                                assets.map((asset) => (
                                    <div key={asset.id} className="group relative bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-all">
                                        {asset.type === 'image' ? (
                                            <div className="aspect-video bg-zinc-900 relative">
                                                <img src={asset.content} alt={asset.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button onClick={() => handleDownloadImage(asset.content)} className="p-2 bg-zinc-800 rounded-full hover:bg-white hover:text-black"><Download size={14} /></button>
                                                    <button onClick={(e) => handleDelete(asset.id, e)} className="p-2 bg-red-900/50 text-red-400 rounded-full hover:bg-red-600 hover:text-white"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 relative">
                                                <div className="flex items-center gap-2 mb-2 text-purple-400 text-[10px] font-bold uppercase">
                                                    <Type size={12} /> {asset.style}
                                                </div>
                                                <p className="text-xs text-zinc-400 line-clamp-3 font-mono">{asset.content}</p>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <button onClick={() => handleCopyText(asset.content)} className="p-1.5 bg-zinc-800 rounded hover:bg-white hover:text-black"><Copy size={12} /></button>
                                                    <button onClick={(e) => handleDelete(asset.id, e)} className="p-1.5 bg-zinc-800 text-red-400 rounded hover:bg-red-600 hover:text-white"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-2 border-t border-zinc-800">
                                            <p className="text-[10px] font-bold text-zinc-300 truncate">{asset.title}</p>
                                            <p className="text-[9px] text-zinc-600">{new Date(asset.generatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};