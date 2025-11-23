import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').unique(),
    password: text('password'), // Hashed password
    stackUserId: text('stack_user_id').unique(), // Stack Auth user ID (optional now)
    xp: integer('xp').default(0),
    level: integer('level').default(1),
    totalActions: integer('total_actions').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
    id: text('id').primaryKey(),
    userId: text('user_id'), // Multi-user support
    title: text('title').notNull(),
    description: text('description'),
    assignee: text('assignee').notNull(),
    priority: text('priority').notNull(),
    status: text('status').default('todo'),
    estimatedTime: text('estimated_time'),
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at'),
});

export const chatHistory = pgTable('chat_history', {
    id: serial('id').primaryKey(),
    userId: text('user_id'), // Multi-user support
    agentId: text('agent_id').notNull(),
    role: text('role').notNull(),
    text: text('text').notNull(),
    timestamp: text('timestamp').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const competitorReports = pgTable('competitor_reports', {
    id: serial('id').primaryKey(),
    userId: text('user_id'), // Multi-user support
    competitorName: text('competitor_name').notNull(),
    threatLevel: text('threat_level'),
    data: jsonb('data'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const businessContext = pgTable('business_context', {
    id: serial('id').primaryKey(),
    userId: text('user_id'), // Multi-user support
    companyName: text('company_name'),
    founderName: text('founder_name'),
    industry: text('industry'),
    description: text('description'),
    brandDna: jsonb('brand_dna'),
    updatedAt: timestamp('updated_at').defaultNow(),
});
