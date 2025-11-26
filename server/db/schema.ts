import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

// ========================================
// USERS & AUTHENTICATION
// ========================================

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').unique(),
    password: text('password'), // Hashed password
    stackUserId: text('stack_user_id').unique(), // Stack Auth user ID (optional now)
    role: text('role').default('user'), // 'user' | 'admin'
    adminPinHash: text('admin_pin_hash'), // Hashed PIN for admin access
    xp: integer('xp').default(0),
    level: integer('level').default(1),
    totalActions: integer('total_actions').default(0),
    suspended: boolean('suspended').default(false),
    suspendedAt: timestamp('suspended_at'),
    suspendedReason: text('suspended_reason'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// SUBSCRIPTIONS & BILLING
// ========================================

export const subscriptions = pgTable('subscriptions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripePriceId: text('stripe_price_id'),
    tier: text('tier').notNull(), // 'starter' | 'professional' | 'empire'
    status: text('status').notNull(), // 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    trialEndsAt: timestamp('trial_ends_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const usageTracking = pgTable('usage_tracking', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    month: text('month').notNull(), // 'YYYY-MM'
    aiGenerations: integer('ai_generations').default(0),
    competitorsTracked: integer('competitors_tracked').default(0),
    businessProfiles: integer('business_profiles').default(1),
    createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// ADMIN
// ========================================

export const adminActions = pgTable('admin_actions', {
    id: serial('id').primaryKey(),
    adminUserId: integer('admin_user_id').notNull().references(() => users.id),
    action: text('action').notNull(), // 'user_suspended', 'subscription_refunded', etc.
    targetUserId: integer('target_user_id'),
    details: jsonb('details'),
    createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// CORE DATA
// ========================================

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

// ========================================
// UNIVERSAL SEARCH
// ========================================

export const searchIndex = pgTable('search_index', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    entityType: text('entity_type').notNull(), // 'task' | 'chat' | 'warroom' | 'contact' | 'report'
    entityId: text('entity_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(), // Full searchable content
    tags: text('tags').array(), // For filtering
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// NOTIFICATIONS
// ========================================

export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'email' | 'sms' | 'in_app'
    category: text('category').notNull(), // 'deadline' | 'financial' | 'competitive' | 'system'
    title: text('title').notNull(),
    message: text('message').notNull(),
    priority: text('priority').notNull(), // 'low' | 'medium' | 'high' | 'critical'
    read: boolean('read').default(false),
    actionUrl: text('action_url'), // Where to navigate when clicked
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const notificationPreferences = pgTable('notification_preferences', {
    userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    emailEnabled: boolean('email_enabled').default(true),
    smsEnabled: boolean('sms_enabled').default(false),
    inAppEnabled: boolean('in_app_enabled').default(true),
    taskDeadlines: boolean('task_deadlines').default(true),
    financialAlerts: boolean('financial_alerts').default(true),
    competitorAlerts: boolean('competitor_alerts').default(true),
    dailyDigest: boolean('daily_digest').default(true),
    digestTime: text('digest_time').default('08:00'), // HH:MM format
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// DAILY INTELLIGENCE
// ========================================

export const dailyIntelligence = pgTable('daily_intelligence', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // YYYY-MM-DD
    priorityActions: jsonb('priority_actions'), // Array of priority action objects
    alerts: jsonb('alerts'), // Array of alert objects
    insights: jsonb('insights'), // Array of insight objects
    motivationalMessage: text('motivational_message'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

// ========================================
// CONTACTS (NETWORK)
// ========================================

export const contacts = pgTable('contacts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email'),
    company: text('company'),
    role: text('role'),
    notes: text('notes'),
    linkedinUrl: text('linkedin_url'),
    tags: text('tags').array(),
    lastContact: timestamp('last_contact'),
    relationship: text('relationship'), // 'hot' | 'warm' | 'cold' | 'partner' | 'investor'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// PITCH DECKS
// ========================================

export const pitchDecks = pgTable('pitch_decks', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slides: jsonb('slides').notNull(), // Array of slide objects
    generatedAt: timestamp('generated_at').notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// WAR ROOM
// ========================================

export const warRoomSessions = pgTable('war_room_sessions', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    topic: text('topic').notNull(),
    dialogue: jsonb('dialogue').notNull(), // Array of dialogue objects
    consensus: text('consensus'),
    actionPlan: text('action_plan').array(),
    timestamp: timestamp('timestamp').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// OPS & HR (SOPs, JDs, Interviews)
// ========================================

export const sops = pgTable('sops', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    taskName: text('task_name').notNull(),
    goal: text('goal'),
    steps: jsonb('steps').notNull(),
    definitionOfDone: text('definition_of_done').array(),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const jobDescriptions = pgTable('job_descriptions', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleTitle: text('role_title').notNull(),
    hook: text('hook'),
    responsibilities: text('responsibilities').array(),
    requirements: text('requirements').array(),
    perks: text('perks').array(),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const interviewGuides = pgTable('interview_guides', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleTitle: text('role_title').notNull(),
    questions: jsonb('questions').notNull(),
    generatedAt: timestamp('generated_at').defaultNow(),
});

// ========================================
// PRODUCT & STRATEGY
// ========================================

export const productSpecs = pgTable('product_specs', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    featureName: text('feature_name').notNull(),
    summary: text('summary'),
    features: jsonb('features'),
    dataModel: text('data_model').array(),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const pivotAnalyses = pgTable('pivot_analyses', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    currentIndustry: text('current_industry'),
    gaps: jsonb('gaps'), // Array of gap objects
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const launchStrategies = pgTable('launch_strategies', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    productName: text('product_name').notNull(),
    launchDate: text('launch_date'),
    phases: jsonb('phases'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const tribeBlueprints = pgTable('tribe_blueprints', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    manifesto: jsonb('manifesto'),
    rituals: jsonb('rituals'),
    engagementLoops: text('engagement_loops').array(),
    generatedAt: timestamp('generated_at').defaultNow(),
});

// ========================================
// LEGAL & COMPLIANCE
// ========================================

export const legalDocs = pgTable('legal_docs', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    type: text('type').notNull(), // 'contract' | 'policy' | 'terms'
    content: text('content').notNull(),
    generatedAt: timestamp('generated_at').defaultNow(),
});

// ========================================
// TRAINING & SIMULATION
// ========================================

export const trainingHistory = pgTable('training_history', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    scenarioTitle: text('scenario_title'),
    score: integer('score'),
    strengths: text('strengths').array(),
    weaknesses: text('weaknesses').array(),
    proTip: text('pro_tip'),
    timestamp: timestamp('timestamp').defaultNow(),
});

export const simulations = pgTable('simulations', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    query: text('query').notNull(),
    likelyCase: jsonb('likely_case'),
    bestCase: jsonb('best_case'),
    worstCase: jsonb('worst_case'),
    strategicAdvice: text('strategic_advice'),
    timestamp: timestamp('timestamp').defaultNow(),
});

// ========================================
// MARKETING & ASSETS
// ========================================

export const campaigns = pgTable('campaigns', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    sourceTitle: text('source_title'),
    twitterThread: text('twitter_thread').array(),
    linkedinPost: text('linkedin_post'),
    tiktokScript: text('tiktok_script'),
    newsletterSection: text('newsletter_section'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const creativeAssets = pgTable('creative_assets', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'image' | 'copy' | 'video_script'
    title: text('title'),
    content: text('content'), // URL for images, text for copy
    prompt: text('prompt'),
    style: text('style'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

// ========================================
// DEV TOOLS
// ========================================

export const codeSnippets = pgTable('code_snippets', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title'),
    language: text('language'),
    code: text('code'),
    explanation: text('explanation'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const boardReports = pgTable('board_reports', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    date: text('date'),
    ceoScore: integer('ceo_score'),
    executiveSummary: text('executive_summary'),
    consensus: text('consensus'),
    grades: jsonb('grades'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const agentInstructions = pgTable('agent_instructions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    agentId: text('agent_id').notNull(),
    instruction: text('instruction').notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
