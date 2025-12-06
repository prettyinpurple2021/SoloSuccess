import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, AlertTriangle, Info, Zap, Calendar } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { soundService } from '../services/soundService';

export const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        loadNotifications();

        // Subscribe to new notifications
        const unsub = notificationService.subscribe((notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 50));
            soundService.playClick();
        });

        return unsub;
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleDelete = async (id: string) => {
        await notificationService.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'deadline': return <Calendar size={14} className="text-yellow-500" />;
            case 'financial': return <Zap size={14} className="text-emerald-500" />;
            case 'competitive': return <AlertTriangle size={14} className="text-red-500" />;
            default: return <Info size={14} className="text-blue-500" />;
        }
    };

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'critical': return 'border-l-red-500';
            case 'high': return 'border-l-orange-500';
            case 'medium': return 'border-l-yellow-500';
            default: return 'border-l-zinc-600';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => { setIsOpen(!isOpen); soundService.playClick(); }}
                className="relative p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-zinc-500">
                                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={32} className="mx-auto text-zinc-700 mb-2" />
                                <p className="text-sm text-zinc-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`
                                        p-3 border-b border-white/5 hover:bg-white/5 transition-colors
                                        border-l-2 ${getPriorityClass(notification.priority)}
                                        ${!notification.read ? 'bg-white/5' : ''}
                                    `}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">
                                            {getCategoryIcon(notification.category)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-sm font-medium truncate ${!notification.read ? 'text-white' : 'text-zinc-400'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] text-zinc-600 shrink-0">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="text-[10px] text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                                                    >
                                                        <Check size={10} />
                                                        Mark read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1"
                                                >
                                                    <Trash2 size={10} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-white/10 text-center">
                            <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
