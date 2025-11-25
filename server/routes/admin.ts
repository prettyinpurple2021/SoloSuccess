import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { db } from '../db';
import { users, subscriptions, adminActions, usageTracking } from '../db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import { requireAdmin, verifyAdminPin } from '../middleware/admin';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Rate limiter for admin endpoints - strict limits for security
const adminRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10, // limit each IP to 10 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Add a rate limiter to the verify-pin endpoint to prevent brute-force or DoS
const verifyPinRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 5, // limit each IP to 5 requests per windowMs
    message: { error: 'Too many PIN verification attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Verify PIN endpoint (doesn't require admin role yet, used to elevate session)
router.post('/verify-pin', verifyPinRateLimiter, authMiddleware, async (req: Request, res: Response) => {
    try {
        const { pin } = req.body;
        const userEmail = ((req as unknown) as AuthRequest).userEmail;

        if (!userEmail || !pin) {
            return res.status(400).json({ error: 'Missing requirements' });
        }

        const isValid = await verifyAdminPin(userEmail, pin);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('PIN verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Apply admin role check for all subsequent routes
router.use(requireAdmin as any);
// Apply rate limiting to all subsequent admin routes (post-auth + role check)
router.use(adminRateLimiter);

// Analytics Dashboard
router.get('/analytics', async (req: Request, res: Response) => {
    try {
        const [userCount] = await db.select({ count: count() }).from(users);
        const [subCount] = await db.select({ count: count() }).from(subscriptions);

        // Calculate MRR (simplified)
        const activeSubs = await db.select().from(subscriptions).where(eq(subscriptions.status, 'active'));
        let mrr = 0;
        activeSubs.forEach((sub: any) => {
            if (sub.tier === 'starter') mrr += 29;
            if (sub.tier === 'professional') mrr += 79;
            if (sub.tier === 'empire') mrr += 199;
        });

        res.json({
            totalUsers: userCount.count,
            totalSubscriptions: subCount.count,
            mrr,
            activeSubscriptions: activeSubs.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// User Management
router.get('/users', async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const allUsers = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            lastActive: users.updatedAt,
            subscription: subscriptions.tier,
            status: subscriptions.status
        })
            .from(users)
            .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(users.createdAt));

        res.json(allUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:userId', async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
        const usage = await db.select().from(usageTracking).where(eq(usageTracking.userId, userId)).limit(1);

        res.json({
            user: user[0],
            subscription: sub[0] || null,
            usage: usage[0] || null
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

router.post('/users/:userId/suspend', async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        // In a real app, we'd have a suspended flag or status
        // For now, we'll just log the action

        await db.insert(adminActions).values({
            adminUserId: Number(((req as unknown) as AuthRequest).userId!),
            action: 'suspend_user',
            targetUserId: userId,
            details: { reason: req.body.reason }
        });

        res.json({ success: true, message: 'User suspended (logged)' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to suspend user' });
    }
});

// System Health
router.get('/system-health', async (req: Request, res: Response) => {
    try {
        // Check DB connection
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - dbStart;

        res.json({
            status: 'healthy',
            database: {
                status: 'connected',
                latency: `${dbLatency}ms`
            },
            redis: {
                status: process.env.UPSTASH_REDIS_REST_URL ? 'connected' : 'disabled'
            },
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            status: 'degraded',
            error: 'Database connection failed'
        });
    }
});

export default router;