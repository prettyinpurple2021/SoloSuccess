import React from 'react';
import { MarketingLayout } from './layout/MarketingLayout';
import { Mail, MessageSquare, MapPin } from 'lucide-react';

export function ContactPage() {
    return (
        <MarketingLayout>
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-16">
                    <div>
                        <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
                        <p className="text-xl text-zinc-400 mb-12">
                            Have questions about SoloSuccess AI? We're here to help you build your empire.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Email Us</h3>
                                    <p className="text-zinc-400">support@solosuccess.ai</p>
                                    <p className="text-zinc-500 text-sm mt-1">We reply within 24 hours.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Live Chat</h3>
                                    <p className="text-zinc-400">Available for Pro users</p>
                                    <p className="text-zinc-500 text-sm mt-1">Mon-Fri, 9am - 5pm EST.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-violet-500/10 text-violet-400">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Office</h3>
                                    <p className="text-zinc-400">123 Innovation Drive</p>
                                    <p className="text-zinc-500 text-sm mt-1">San Francisco, CA 94105</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                    placeholder="jane@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Message</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
