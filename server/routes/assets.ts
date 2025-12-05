
import { Router } from 'express';
import { db } from '../db';
import { creativeAssets } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all assets for user
router.get('/', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const assets = await db.select().from(creativeAssets)
            .where(eq(creativeAssets.userId, parseInt(userId)))
            .orderBy(desc(creativeAssets.generatedAt));

        res.json(assets);
    } catch (error) {
        console.error("Fetch Assets Error:", error);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

// Save new asset
router.post('/', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const asset = req.body;

        // Ensure ID is unique if provided, or let DB handle it (schema defines ID as text primary key)
        // The frontend generates IDs like `img-${Date.now()}`, which is fine.

        const newAsset = await db.insert(creativeAssets).values({
            id: asset.id,
            userId: parseInt(userId),
            type: asset.type,
            title: asset.title,
            content: asset.content, // This stores the Image URL or the Text Content
            prompt: asset.prompt,
            style: asset.style,
            generatedAt: new Date(asset.generatedAt || Date.now())
        }).returning();

        res.json(newAsset[0]);
    } catch (error) {
        console.error("Save Asset Error:", error);
        res.status(500).json({ error: 'Failed to save asset' });
    }
});

// Delete asset
router.delete('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const { id } = req.params;

        await db.delete(creativeAssets).where(
            and(
                eq(creativeAssets.id, id),
                eq(creativeAssets.userId, parseInt(userId))
            )
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Delete Asset Error:", error);
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});

export default router;
