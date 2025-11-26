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
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return await response.json();
        } catch (error) {
            console.error('Get notifications error:', error);
            return [];
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
    async markAsRead(id: number): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Mark read error:', error);
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Mark all read error:', error);
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
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
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications/preferences', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch preferences');
            return await response.json();
        } catch (error) {
            console.error('Get preferences error:', error);
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

    /**
     * Update notification preferences
     */
    async updatePreferences(prefs: NotificationPreferences): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(prefs)
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

        // Notify listeners
        this.listeners.forEach(listener => listener(newNotification));
    }
}

export const notificationService = new NotificationService();
