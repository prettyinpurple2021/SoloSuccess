// Notification Service
export interface Notification {
    id: string;
    type: 'email' | 'sms' | 'in_app';
    category: 'deadline' | 'financial' | 'competitive' | 'system';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    read: boolean;
    actionUrl?: string;
    sentAt?: string;
    createdAt: string;
}

export interface NotificationPreferences {
    emailEnabled: boolean;
    smsEnabled: boolean;
    inAppEnabled: boolean;
    taskDeadlines: boolean;
    financialAlerts: boolean;
    competitorAlerts: boolean;
    dailyDigest: boolean;
    digestTime: string; // HH:MM
}

type NotificationListener = (notification: Notification) => void;

class NotificationService {
    private listeners: Set<NotificationListener> = new Set();
    private localKey = 'notifications';

    /**
     * Subscribe to new notifications
     */
    subscribe(listener: NotificationListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Get all notifications for current user
     */
    async getNotifications(): Promise<Notification[]> {
        try {
            const response = await fetch('/api/notifications');
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return await response.json();
        } catch (error) {
            console.error('Get notifications error:', error);
            // Fallback to local storage
            return this.getLocalNotifications();
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
        const notifications = await this.getNotifications();
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Delete notification error:', error);
        }
    }

    /**
     * Get notification preferences
     */
    async getPreferences(): Promise<NotificationPreferences> {
        try {
            const response = await fetch('/api/notifications/preferences');
            if (!response.ok) throw new Error('Failed to fetch preferences');
            return await response.json();
        } catch (error) {
            console.error('Get preferences error:', error);
            return this.getDefaultPreferences();
        }
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
        try {
            await fetch('/api/notifications/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });
        } catch (error) {
            console.error('Update preferences error:', error);
        }
    }

    /**
     * Create in-app notification (local)
     */
    createLocal(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
        const newNotification: Notification = {
            ...notification,
            id: `local-${Date.now()}`,
            read: false,
            createdAt: new Date().toISOString()
        };

        // Save to local storage
        const notifications = this.getLocalNotifications();
        notifications.unshift(newNotification);
        localStorage.setItem(this.localKey, JSON.stringify(notifications.slice(0, 50))); // Keep last 50

        // Notify listeners
        this.listeners.forEach(listener => listener(newNotification));
    }

    /**
     * Get local notifications from localStorage
     */
    private getLocalNotifications(): Notification[] {
        const stored = localStorage.getItem(this.localKey);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get default preferences
     */
    private getDefaultPreferences(): NotificationPreferences {
        return {
            emailEnabled: true,
            smsEnabled: false,
            inAppEnabled: true,
            taskDeadlines: true,
            financialAlerts: true,
            competitorAlerts: true,
            dailyDigest: true,
            digestTime: '08:00'
        };
    }
}

export const notificationService = new NotificationService();
