import { Router } from 'express';
import { db } from '../db';
import { searchIndex } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { SearchIndexer } from '../utils/searchIndexer';

const router = Router();

// Search
router.post('/', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        // Extract query from query params or body
        // Accept query only if it is a string (prevent arrays/type confusion)
        let rawQuery = req.query.q ?? req.body.query;
        const query = (typeof rawQuery === 'string') ? rawQuery : '';

        if (typeof query !== 'string' || !query || query.length < 2) {
            return res.json([]);
        }

        // Full-Text Search using PostgreSQL tsvector
        // Matches against both title and content with ranking
        const results = await db.select({
            entityId: searchIndex.entityId,
            entityType: searchIndex.entityType,
            title: searchIndex.title,
            content: searchIndex.content,
            updatedAt: searchIndex.updatedAt,
            rank: sql<number>`ts_rank(to_tsvector('english', ${searchIndex.title} || ' ' || ${searchIndex.content}), plainto_tsquery('english', ${query}))`.as('rank')
        })
            .from(searchIndex)
            .where(
                and(
                    eq(searchIndex.userId, userId),
                    sql`to_tsvector('english', ${searchIndex.title} || ' ' || ${searchIndex.content}) @@ plainto_tsquery('english', ${query})`
                )
            )
            .orderBy(desc(sql`rank`))
            .limit(20);

        const formatted = results.map(r => ({
            id: r.entityId,
            type: r.entityType,
            title: r.title,
            snippet: r.content.substring(0, 150) + '...',
            path: getPathForType(r.entityType, r.entityId),
            timestamp: r.updatedAt,
            relevance: 100 // Placeholder
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Manual Index (for testing or manual triggers)
router.post('/index', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const { type, id, title, content, tags } = req.body;

        await SearchIndexer.indexEntity(userId, type, id, title, content, tags);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Indexing failed' });
    }
});

router.delete('/index', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const { type, id } = req.body;

        await SearchIndexer.removeFromIndex(userId, type, id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Remove failed' });
    }
});

function getPathForType(type: string, id: string): string {
    switch (type) {
        case 'task': return '/app/roadmap';
        case 'contact': return '/app/network';
        case 'report': return '/app/competitor-stalker';
        case 'chat': return `/app/chat/${id}`; // id might need to be agentId
        default: return '/app/dashboard';
    }
}

export default router;
