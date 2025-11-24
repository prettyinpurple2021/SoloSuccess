import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, FileText, MessageSquare, Users, Flag, TrendingUp, Filter } from 'lucide-react';
import { searchService, SearchResult } from '../services/searchService';

interface UniversalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (path: string) => void;
}

export function UniversalSearch({ isOpen, onClose, onNavigate }: UniversalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setRecentSearches(searchService.getRecentSearches());
        } else {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const searchDebounced = setTimeout(async () => {
            setIsLoading(true);
            const searchResults = await searchService.search(query);
            setResults(searchResults);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(searchDebounced);
    }, [query]);

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        if (searchQuery.trim()) {
            searchService.saveRecentSearch(searchQuery);
        }
    };

    const handleSelect = (result: SearchResult) => {
        onNavigate(result.path);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    const getIconForType = (type: SearchResult['type']) => {
        switch (type) {
            case 'task': return <Flag size={16} />;
            case 'chat': return <MessageSquare size={16} />;
            case 'contact': return <Users size={16} />;
            case 'report': return <TrendingUp size={16} />;
            default: return <FileText size={16} />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div
                className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onKeyDown={handleKeyDown}
            >
                {/* Search Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
                    <Search className="text-zinc-500" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search tasks, chats, contacts, reports..."
                        className="flex-1 bg-transparent border-none text-lg text-white placeholder-zinc-600 focus:outline-none"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        title="Filters"
                    >
                        <Filter size={18} className={showFilters ? 'text-emerald-500' : 'text-zinc-500'} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        title="Close (Esc)"
                    >
                        <X size={18} className="text-zinc-500" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="py-12 text-center">
                            <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-zinc-500 text-sm mt-4">Searching...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="p-2">
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all text-left ${index === selectedIndex
                                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                                            : 'hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-zinc-500'
                                        }`}>
                                        {getIconForType(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-white text-sm">{result.title}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">
                                                {result.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 line-clamp-2">{result.snippet}</p>
                                        <p className="text-xs text-zinc-600 mt-1">{new Date(result.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query.trim().length >= 2 ? (
                        <div className="py-12 text-center text-zinc-500">
                            <Search size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No results found for "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <p className="text-xs uppercase tracking-wider text-zinc-600 font-bold mb-4">Recent Searches</p>
                            {recentSearches.length > 0 ? (
                                <div className="space-y-2">
                                    {recentSearches.map((search, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(search)}
                                            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                                        >
                                            <Clock size={14} className="text-zinc-600" />
                                            <span className="text-sm text-zinc-400">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-600 text-center py-8">
                                    Start typing to search across all your data
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-600">
                    <div className="flex gap-4">
                        <span><strong className="text-zinc-400">↑↓</strong> Navigate</span>
                        <span><strong className="text-zinc-400">↵</strong> Select</span>
                        <span><strong className="text-zinc-400">Esc</strong> Close</span>
                    </div>
                    <div>
                        <strong>Cmd+/</strong> to open
                    </div>
                </div>
            </div>
        </div>
    );
}
