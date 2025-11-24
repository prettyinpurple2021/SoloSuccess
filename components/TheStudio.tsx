import React, { useState } from 'react';
import { Paintbrush, Image as ImageIcon, Loader2, Download, Sparkles, Palette, Layers, Save } from 'lucide-react';
import { generateBrandImage } from '../services/geminiService';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { CreativeAsset } from '../types';

const STYLES = [
    { id: 'cyberpunk', label: 'Cyberpunk / High Tech', desc: 'Neon, dark, futuristic, glowing' },
    { id: 'minimal', label: 'Minimalist / SaaS', desc: 'Clean lines, whitespace, flat colors' },
    { id: 'cinematic', label: 'Cinematic / Dramatic', desc: 'High contrast, moody lighting, realistic' },
    { id: 'sketch', label: 'Hand-Drawn / Sketch', desc: 'Artistic, rough lines, human touch' },
    { id: 'corporate', label: 'Corporate / Professional', desc: 'Safe, blue tones, stock photo vibe' }
];

export const TheStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const saveToVault = (imageBase64: string) => {
        const newAsset: CreativeAsset = {
            id: `img-${Date.now()}`,
            prompt: prompt,
            style: selectedStyle.label,
            imageBase64: imageBase64,
            createdAt: new Date().toISOString()
        };

        const savedRaw = localStorage.getItem('solo_creative_assets');
        const savedAssets: CreativeAsset[] = savedRaw ? JSON.parse(savedRaw) : [];
        localStorage.setItem('solo_creative_assets', JSON.stringify([newAsset, ...savedAssets]));
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setGeneratedImage(null);
        soundService.playClick();

        const result = await generateBrandImage(prompt, selectedStyle.desc);

        if (result) {
            setGeneratedImage(result);
            saveToVault(result);

            const { leveledUp } = await addXP(60);
            showToast("ASSET CREATED", "Saved to The Vault.", "xp", 60);
            if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
            soundService.playSuccess();
        } else {
            showToast("RENDER FAILED", "Could not generate image.", "error");
            soundService.playError();
        }

        setLoading(false);
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const a = document.createElement('a');
        a.href = generatedImage;
        a.download = `solo_studio_asset_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("DOWNLOADING", "Asset saved to device.", "info");
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
                    <p className="text-zinc-400 mt-2">Generative branding and visual asset forge.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Controls */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Layers size={14} /> Style Matrix
                        </h3>
                        <div className="space-y-2">
                            {STYLES.map((style) => (
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
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles size={14} /> Prompt
                        </h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image you need (e.g., 'A sleek modern logo for a coffee startup' or 'Abstract background with blue gradients')..."
                            className="w-full h-32 bg-black border border-zinc-700 rounded p-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-none font-mono text-sm"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Paintbrush size={18} /> Generate Asset</>}
                    </button>
                </div>

                {/* Canvas / Result */}
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col relative min-h-[500px]">
                    {/* Canvas Background Grid */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                    {!generatedImage && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
                            <ImageIcon size={64} strokeWidth={1} />
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
                                <p className="animate-pulse">Synthesizing Visuals...</p>
                                <p className="text-zinc-600">Applying {selectedStyle.id} Filter...</p>
                            </div>
                        </div>
                    )}

                    {generatedImage && (
                        <div className="relative flex-1 flex items-center justify-center p-8 animate-in zoom-in duration-500">
                            <img
                                src={generatedImage}
                                alt="Generated Asset"
                                className="max-w-full max-h-full rounded-lg shadow-2xl border border-zinc-700"
                            />

                            <div className="absolute bottom-4 right-4">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-white hover:text-black text-white border border-zinc-700 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
                                >
                                    <Download size={16} /> Download
                                </button>
                            </div>

                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-emerald-500/90 rounded text-black text-[10px] font-bold uppercase">
                                <Save size={12} /> Saved to Vault
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};