import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 overflow-hidden relative flex flex-col">
            {/* Global Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </div>

            <Navbar />

            <main className="flex-1 relative z-10">
                {children}
            </main>

            <Footer />
        </div>
    );
}
