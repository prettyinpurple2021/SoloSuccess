import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db';
import { users, tasks, chatHistory, competitorReports, businessContext } from './db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Routes ---

// AI Generation Proxy
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, systemInstruction, model, history, temperature, maxOutputTokens } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY not found");
            return res.status(500).json({ error: 'Server configuration error: API Key missing' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const targetModel = model || 'gemini-2.5-flash'; // Default fallback

        if (history && Array.isArray(history)) {
            // Chat Mode - uses chats.create like in geminiService.ts
            const formattedHistory = history.map((h: any) => ({
                role: h.role,
                parts: [{ text: h.text }]
            }));

            const chat = ai.chats.create({
                model: targetModel,
                config: {
                    systemInstruction,
                    temperature: temperature || 0.8,
                    maxOutputTokens
                },
                history: formattedHistory
            });

            const result = await chat.sendMessage({ message: prompt });
            res.json({ text: result.text || '' });
        } else {
            // Single Generation Mode - no history, just a one-off generation
            // Use the same chat interface but with empty history
            const chat = ai.chats.create({
                model: targetModel,
                config: {
                    systemInstruction,
                    temperature: temperature || 0.7,
                    maxOutputTokens
                },
                history: []
            });

            const result = await chat.sendMessage({ message: prompt });
            res.json({ text: result.text || '' });
        }
    } catch (error) {
        console.error("Generation error:", error);
        res.status(500).json({ error: 'Generation failed' });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: process.env.DATABASE_URL ? 'configured' : 'missing_env' });
});

// User Progress
app.get('/api/user', async (req, res) => {
    try {
        // For single user mode, we just get the first user or create one
        let user = await db.select().from(users).limit(1);
        if (user.length === 0) {
            const newUser = await db.insert(users).values({ email: 'founder@solosuccess.ai' }).returning();
            return res.json(newUser[0]);
        }
        res.json(user[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/user/progress', async (req, res) => {
    try {
        const { xp, level, totalActions } = req.body;
        // Update the single user
        // In a real multi-user app, we'd use req.user.id
        const updated = await db.update(users)
            .set({ xp, level, totalActions, updatedAt: new Date() })
            .returning();
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
        res.json(allTasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const taskData = req.body;
        // Upsert logic (insert or update)
        const existing = await db.select().from(tasks).where(eq(tasks.id, taskData.id));

        if (existing.length > 0) {
            const updated = await db.update(tasks).set(taskData).where(eq(tasks.id, taskData.id)).returning();
            res.json(updated[0]);
        } else {
            const newT = await db.insert(tasks).values(taskData).returning();
            res.json(newT[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save task' });
    }
});

app.post('/api/tasks/batch', async (req, res) => {
    try {
        const taskList = req.body; // Array of tasks
        if (!Array.isArray(taskList)) return res.status(400).json({ error: "Expected array" });

        // Simple loop for prototype (could be optimized with batch insert)
        for (const t of taskList) {
            const existing = await db.select().from(tasks).where(eq(tasks.id, t.id));
            if (existing.length > 0) {
                await db.update(tasks).set(t).where(eq(tasks.id, t.id));
            } else {
                await db.insert(tasks).values(t);
            }
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to batch save' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(tasks).where(eq(tasks.id, id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

app.delete('/api/tasks', async (req, res) => {
    try {
        await db.delete(tasks);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear tasks' });
    }
});

// Chat History
app.get('/api/chat/:agentId', async (req, res) => {
    try {
        const history = await db.select()
            .from(chatHistory)
            .where(eq(chatHistory.agentId, req.params.agentId))
            .orderBy(chatHistory.id); // Order by ID (insertion order)
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { agentId, messages } = req.body;
        // We expect the full history or new messages. 
        // For simplicity in this migration, let's just append the NEWEST message if it's a single message, 
        // OR if the frontend sends the whole list, we might need to be careful.
        // Strategy: The frontend `storageService.saveChatHistory` sends the WHOLE list.
        // We should probably wipe and replace for this simple prototype, OR better:
        // The frontend should ideally only send the new message.
        // Let's stick to the `storageService` contract: it sends the whole list.
        // To be efficient, we'll delete for agent and re-insert (brute force but safe for prototype).

        await db.delete(chatHistory).where(eq(chatHistory.agentId, agentId));

        if (messages.length > 0) {
            const toInsert = messages.map((m: any) => ({
                agentId,
                role: m.role,
                text: m.text,
                timestamp: String(m.timestamp)
            }));
            await db.insert(chatHistory).values(toInsert);
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save chat' });
    }
});

// Business Context
app.get('/api/context', async (req, res) => {
    try {
        const ctx = await db.select().from(businessContext).limit(1);
        res.json(ctx[0] || null);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch context' });
    }
});

app.post('/api/context', async (req, res) => {
    try {
        const data = req.body;
        // Check if exists
        const existing = await db.select().from(businessContext).limit(1);
        if (existing.length > 0) {
            const updated = await db.update(businessContext)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(businessContext.id, existing[0].id))
                .returning();
            res.json(updated[0]);
        } else {
            const newCtx = await db.insert(businessContext).values(data).returning();
            res.json(newCtx[0]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to save context' });
    }
});

// Reports
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await db.select().from(competitorReports).orderBy(desc(competitorReports.generatedAt));
        // Map back to frontend format if needed (data column has the details)
        const formatted = reports.map(r => ({
            ...r.data as object,
            id: r.id,
            generatedAt: r.generatedAt
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

app.post('/api/reports', async (req, res) => {
    try {
        const report = req.body;
        await db.insert(competitorReports).values({
            competitorName: report.competitorName,
            threatLevel: report.threatLevel,
            data: report,
            generatedAt: new Date(report.generatedAt || Date.now())
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save report' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
