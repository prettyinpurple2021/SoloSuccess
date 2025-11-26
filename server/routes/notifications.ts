import { Router } from 'express';
import { db } from '../db';
import { notifications, notificationPreferences } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all notifications
router.get('/', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;

        const userNotifications = await db.select().from(notifications)
            .where(eq(notifications.userId, Number(userId)))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        res.json(userNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark as read
router.post('/:id/read', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const notificationId = Number(req.params.id);

        await db.update(notifications)
            .set({ read: true })
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, Number(userId))));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// Mark all as read
router.post('/read-all', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;

        await db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.userId, Number(userId)));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const notificationId = Number(req.params.id);

        await db.delete(notifications)
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, Number(userId))));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// Get preferences
router.get('/preferences', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;

        const prefs = await db.select().from(notificationPreferences)
            .where(eq(notificationPreferences.userId, Number(userId)))
            .limit(1);

        if (prefs.length === 0) {
            // Return defaults if not set
            return res.json({
                emailEnabled: true,
                smsEnabled: false,
                inAppEnabled: true,
                taskDeadlines: true,
                financialAlerts: true,
                competitorAlerts: true,
                dailyDigest: true,
                digestTime: '08:00'
            });
        }

        res.json(prefs[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// Update preferences
router.put('/preferences', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const newPrefs = req.body;

        const existing = await db.select().from(notificationPreferences)
            .where(eq(notificationPreferences.userId, Number(userId)))
            .limit(1);

        if (existing.length > 0) {
            await db.update(notificationPreferences)
                .set({ ...newPrefs, updatedAt: new Date() })
                .where(eq(notificationPreferences.userId, Number(userId)));
        } else {
            await db.insert(notificationPreferences)
                .values({ ...newPrefs, userId: Number(userId) });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

export default router;
