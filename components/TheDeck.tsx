import React, { useState, useRef } from 'react';
import { Presentation, RefreshCcw, Download, Layout, ChevronRight, ChevronLeft, FileText, MonitorPlay, Save, Edit2, Check, Image as ImageIcon, Loader2, FileType, Printer, Code2, ChevronDown } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { PitchDeck, Slide } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { downloadMarkdown } from '../services/exportService';
import { storageService } from '../services/storageService';

export const TheDeck: React.FC = () => {
    const [deck, setDeck] = useState<PitchDeck | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<'minimal' | 'dark' | 'corporate'>('dark');
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const templates = {
        minimal: { name: 'Minimal', bg: 'bg-white', text: 'text-gray-900', accent: 'text-gray-600' },
        dark: { name: 'Dark', bg: 'bg-zinc-900', text: 'text-white', accent: 'text-emerald-400' },
        corporate: { name: 'Corporate', bg: 'bg-slate-800', text: 'text-white', accent: 'text-blue-400' }
    };

    const saveToVault = async (newDeck: PitchDeck) => {
        const deckWithId = { ...newDeck, id: newDeck.id || `deck-${Date.now()}` };
        await storageService.savePitchDeck(deckWithId);
        setDeck(deckWithId); // Update local state with saved version
    };

    const handleGenerate = async () => {
        setLoading(true);
        soundService.playClick();
        try {
            const result = await geminiService.generatePitchDeck();

            // Validation
            if (result && result.title && Array.isArray(result.slides) && result.slides.length > 0) {
                // Assign ID
                result.id = `deck-${Date.now()}`;

                setDeck(result);
                await saveToVault(result);
                setCurrentSlide(0);

                const { leveledUp } = await addXP(100);
                showToast("DECK GENERATED", "Saved to The Vault.", "xp", 100);
                if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
                soundService.playSuccess();
            } else {
                console.error("Invalid deck data received:", result);
                showToast("GENERATION FAILED", "AI returned incomplete data. Please try again.", "error");
                soundService.playError();
            }
        } catch (error) {
            console.error("Deck generation error:", error);
            showToast("GENERATION FAILED", "An error occurred. Please try again.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const handleNext = () => {
        if (!deck) return;
        if (currentSlide < deck.slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
            soundService.playClick();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
            soundService.playClick();
        }
    };

    const handleExport = (format: 'markdown' | 'html' | 'pdf') => {
        if (!deck) return;
        soundService.playClick();
        setShowExportMenu(false);

        if (format === 'markdown') {
            let content = `# ${deck.title}\nGenerated: ${new Date(deck.generatedAt).toLocaleDateString()}\n\n`;
            deck.slides.forEach((slide, i) => {
                content += `## Slide ${i + 1}: ${slide.title}\n`;
                content += `**Key Takeaway:** ${slide.keyPoint}\n\n`;
                content += `**Content:**\n${slide.content.map(c => `- ${c}`).join('\n')}\n\n`;
                if (slide.imageUrl) {
                    content += `**Visual Asset:** ![Slide Image](${slide.imageUrl})\n\n`;
                } else {
                    content += `**Visual Concept:** [${slide.visualIdea}]\n\n`;
                }
                content += `---\n\n`;
            });
            downloadMarkdown('Pitch_Deck_Outline', content);
            showToast("EXPORT COMPLETE", "Deck downloaded as Markdown.", "info");
        } else if (format === 'html' || format === 'pdf') {
            const template = templates[selectedTemplate];
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${deck.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; }
        .slide { page-break-after: always; min-height: 100vh; padding: 48px; display: flex; flex-direction: column; }
        .slide:last-child { page-break-after: avoid; }
        .slide-number { font-size: 12px; opacity: 0.5; margin-bottom: 24px; }
        .slide-title { font-size: 36px; font-weight: 700; margin-bottom: 16px; }
        .key-point { font-size: 18px; font-style: italic; margin-bottom: 32px; padding: 16px; border-left: 4px solid; }
        .content-list { list-style: none; }
        .content-list li { font-size: 20px; padding: 12px 0; border-bottom: 1px solid rgba(128,128,128,0.2); }
        .visual-note { margin-top: auto; font-size: 14px; opacity: 0.6; }
        .image-container { margin-top: 24px; text-align: center; }
        .image-container img { max-width: 80%; max-height: 300px; border-radius: 8px; }
        @media print { .slide { min-height: 100vh; } }
    </style>
</head>
<body class="${template.bg.replace('bg-', '')}">
${deck.slides.map((slide, i) => `
    <div class="slide" style="background: ${template.bg === 'bg-white' ? '#ffffff' : template.bg === 'bg-zinc-900' ? '#18181b' : '#1e293b'}; color: ${template.text === 'text-white' ? '#ffffff' : '#111827'}">
        <div class="slide-number">Slide ${i + 1} of ${deck.slides.length}</div>
        <h1 class="slide-title">${slide.title}</h1>
        <div class="key-point" style="border-color: ${template.accent === 'text-emerald-400' ? '#34d399' : template.accent === 'text-blue-400' ? '#60a5fa' : '#4b5563'}; color: ${template.accent === 'text-emerald-400' ? '#34d399' : template.accent === 'text-blue-400' ? '#60a5fa' : '#4b5563'}">
            ${slide.keyPoint}
        </div>
        <ul class="content-list">
            ${slide.content.map(c => `<li>${c}</li>`).join('')}
        </ul>
        ${slide.imageUrl ? `<div class="image-container"><img src="${slide.imageUrl}" alt="Slide visual" /></div>` : `<div class="visual-note">Visual concept: ${slide.visualIdea}</div>`}
    </div>
`).join('')}
</body>
</html>`;

            if (format === 'pdf') {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                    showToast("PRINT READY", "Use browser print to save as PDF.", "info");
                }
            } else {
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${deck.title.replace(/\s+/g, '_')}_Deck.html`;
                a.click();
                URL.revokeObjectURL(url);
                showToast("EXPORT COMPLETE", "Deck downloaded as HTML.", "info");
            }
        }
    };

    const handleGenerateImage = async () => {
        if (!deck) return;
        setImageLoading(true);
        soundService.playClick();

        const slide = deck.slides[currentSlide];
        const prompt = `Professional pitch deck slide visual. ${slide.visualIdea}. Style: Modern, Minimalist, Corporate, High Quality.`;

        try {
            const imageBase64 = await geminiService.generateBrandImage(prompt, "Modern Corporate");
            if (imageBase64) {
                const newDeck = { ...deck };
                newDeck.slides[currentSlide].imageUrl = imageBase64;
                setDeck(newDeck);
                await saveToVault(newDeck);
                showToast("VISUAL GENERATED", "Image added to slide.", "success");
                soundService.playSuccess();
            } else {
                showToast("GENERATION FAILED", "Could not generate image.", "error");
                soundService.playError();
            }
        } catch (error) {
            console.error("Image gen error:", error);
            showToast("ERROR", "Failed to generate visual.", "error");
        }
        setImageLoading(false);
    };

    const handleUpdateSlide = (field: keyof Slide, value: any, index?: number) => {
        if (!deck) return;
        const newDeck = { ...deck };
        const slide = newDeck.slides[currentSlide];

        if (field === 'content' && typeof index === 'number') {
            slide.content[index] = value;
        } else if (field === 'title' || field === 'keyPoint') {
            (slide as any)[field] = value;
        }

        setDeck(newDeck);
    };

    const handleSaveEdit = async () => {
        if (deck) {
            await saveToVault(deck);
            setIsEditing(false);
            showToast("SAVED", "Deck updates saved.", "success");
            soundService.playSuccess();
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-purple-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Presentation size={14} /> Investor Relations
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">THE DECK 2.0</h2>
                    <p className="text-zinc-400 mt-2">AI-powered pitch deck creator with visual generation.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {deck && (
                        <>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center justify-center gap-2 px-4 py-2 border rounded font-bold text-xs uppercase tracking-wider transition-all flex-1 md:flex-initial ${isEditing ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white'}`}
                            >
                                {isEditing ? <Save size={16} onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} /> : <Edit2 size={16} />}
                                {isEditing ? 'Save Changes' : 'Edit Mode'}
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded font-bold text-xs uppercase tracking-wider transition-all"
                                >
                                    <Download size={16} />
                                    Export
                                    <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                                </button>
                                {showExportMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-2 border-b border-zinc-700">
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 mb-1">Template Style</p>
                                            <div className="flex gap-1">
                                                {(Object.keys(templates) as Array<keyof typeof templates>).map((key) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setSelectedTemplate(key)}
                                                        className={`flex-1 px-2 py-1.5 text-[10px] rounded font-medium transition-all ${selectedTemplate === key ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                                                    >
                                                        {templates[key].name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-1">
                                            <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded transition-colors">
                                                <Printer size={16} className="text-purple-400" />
                                                <div className="text-left">
                                                    <span className="block">Print to PDF</span>
                                                    <span className="text-[10px] text-zinc-500">Best for presentations</span>
                                                </div>
                                            </button>
                                            <button onClick={() => handleExport('html')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded transition-colors">
                                                <Code2 size={16} className="text-blue-400" />
                                                <div className="text-left">
                                                    <span className="block">HTML File</span>
                                                    <span className="text-[10px] text-zinc-500">Open in browser</span>
                                                </div>
                                            </button>
                                            <button onClick={() => handleExport('markdown')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded transition-colors">
                                                <FileType size={16} className="text-emerald-400" />
                                                <div className="text-left">
                                                    <span className="block">Markdown</span>
                                                    <span className="text-[10px] text-zinc-500">For documentation</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/50 text-purple-400 rounded font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-initial"
                    >
                        {loading ? <RefreshCcw size={16} className="animate-spin" /> : <Layout size={16} />}
                        {loading ? 'Drafting...' : 'New Deck'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center relative">

                {!deck && !loading && (
                    <div className="text-center opacity-50 text-zinc-500">
                        <MonitorPlay size={64} strokeWidth={1} className="mx-auto mb-4" />
                        <p className="font-mono uppercase tracking-widest">No Deck Loaded</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center text-purple-500">
                        <div className="w-16 h-16 border-4 border-purple-900/30 rounded-full border-t-purple-500 animate-spin mx-auto mb-4"></div>
                        <p className="font-mono uppercase tracking-widest animate-pulse">Architecting Narrative...</p>
                    </div>
                )}

                {deck && (
                    <div className="w-full max-w-5xl relative">
                        {/* Save Indicator */}
                        {!isEditing && (
                            <div className="absolute -top-8 right-0 flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-500 animate-in fade-in slide-in-from-bottom-2">
                                <Check size={12} /> Saved to Vault
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex justify-between absolute top-1/2 -translate-y-1/2 w-full -ml-4 md:-ml-16 px-2 md:px-0 z-20 pointer-events-none">
                            <button
                                onClick={handlePrev}
                                disabled={currentSlide === 0}
                                className="pointer-events-auto p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500 disabled:opacity-30 disabled:hover:border-zinc-800 transition-all shadow-xl"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={currentSlide === deck.slides.length - 1}
                                className="pointer-events-auto p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500 disabled:opacity-30 disabled:hover:border-zinc-800 transition-all shadow-xl translate-x-8 md:translate-x-0"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Slide Card */}
                        <div className="bg-white text-black aspect-auto md:aspect-video rounded-xl p-6 md:p-12 shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-500 key={currentSlide}">

                            <div className="absolute top-0 left-0 w-2 h-full bg-purple-600"></div>
                            <div className="absolute bottom-6 right-8 text-zinc-400 font-mono text-xs uppercase">
                                Slide {currentSlide + 1}/{deck.slides.length} // {deck.title}
                            </div>

                            {/* Title */}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={deck.slides[currentSlide].title}
                                    onChange={(e) => handleUpdateSlide('title', e.target.value)}
                                    className="text-4xl font-black tracking-tight mb-2 text-zinc-900 border-b-2 border-purple-200 focus:border-purple-600 focus:outline-none w-full bg-transparent"
                                />
                            ) : (
                                <h1 className="text-4xl font-black tracking-tight mb-2 text-zinc-900">
                                    {deck.slides[currentSlide].title}
                                </h1>
                            )}

                            {/* Key Point */}
                            <div className="text-purple-600 font-bold text-lg mb-8 uppercase tracking-wider flex items-center gap-2">
                                <Layout size={18} />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={deck.slides[currentSlide].keyPoint}
                                        onChange={(e) => handleUpdateSlide('keyPoint', e.target.value)}
                                        className="border-b border-purple-200 focus:border-purple-600 focus:outline-none w-full bg-transparent"
                                    />
                                ) : (
                                    deck.slides[currentSlide].keyPoint
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 flex-1">
                                <div className="space-y-4">
                                    {deck.slides[currentSlide].content.map((point, i) => (
                                        <div key={i} className="flex items-start gap-3 text-lg text-zinc-700 leading-relaxed">
                                            <span className="mt-1.5 w-2 h-2 bg-zinc-900 rounded-full shrink-0"></span>
                                            {isEditing ? (
                                                <textarea
                                                    value={point}
                                                    onChange={(e) => handleUpdateSlide('content', e.target.value, i)}
                                                    className="w-full bg-zinc-50 border border-zinc-200 rounded p-2 text-sm focus:border-purple-500 focus:outline-none resize-none"
                                                    rows={2}
                                                />
                                            ) : (
                                                point
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Visual Area */}
                                <div className="relative group">
                                    {deck.slides[currentSlide].imageUrl ? (
                                        <div className="relative h-full w-full rounded-lg overflow-hidden border border-zinc-200 shadow-inner bg-zinc-100">
                                            <img
                                                src={deck.slides[currentSlide].imageUrl}
                                                alt="Slide Visual"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Regenerate Button Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={handleGenerateImage}
                                                    disabled={imageLoading}
                                                    className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-2"
                                                >
                                                    <RefreshCcw size={14} /> Regenerate Visual
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center p-6 text-center text-zinc-400 hover:border-purple-400 hover:bg-purple-50 transition-colors group">
                                            {imageLoading ? (
                                                <div className="flex flex-col items-center">
                                                    <Loader2 size={32} className="animate-spin text-purple-600 mb-2" />
                                                    <p className="text-xs font-bold uppercase tracking-widest text-purple-600">Rendering...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon size={32} className="mb-2 opacity-50 group-hover:text-purple-500 group-hover:opacity-100 transition-all" />
                                                    <p className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-500 group-hover:text-purple-600">Visual Concept</p>
                                                    <p className="text-sm italic mb-4">"{deck.slides[currentSlide].visualIdea}"</p>
                                                    <button
                                                        onClick={handleGenerateImage}
                                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-500/25"
                                                    >
                                                        Generate Visual
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Slide Strip Navigation */}
                        <div className="flex justify-center gap-2 mt-8">
                            {deck.slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-purple-500' : 'bg-zinc-800 hover:bg-zinc-600'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};