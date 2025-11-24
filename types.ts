
export enum AgentId {
    ROXY = 'roxy',
    ECHO = 'echo',
    LEXI = 'lexi',
    GLITCH = 'glitch',
    LUMI = 'lumi',
}

export interface Agent {
    id: AgentId;
    name: string;
    title: string;
    description: string;
    color: string;
    avatar: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface CompetitorMetrics {
    innovation: number; // 0-100
    marketPresence: number;
    ux: number;
    pricing: number;
    velocity: number;
}

export interface CompetitorReport {
    competitorName: string;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    missionBrief: string;
    intel: string[];
    vulnerabilities: string[];
    strengths: string[];
    metrics: CompetitorMetrics;
    generatedAt: string;
}

export interface DashboardMetric {
    label: string;
    value: string;
    trend: number; // percentage
    status: 'up' | 'down' | 'neutral';
}

export interface WarRoomEntry {
    speaker: AgentId;
    text: string;
    timestamp?: number;
}

export interface WarRoomResponse {
    dialogue: WarRoomEntry[];
    consensus: string;
    actionPlan: string[];
}

export interface SavedWarRoomSession extends WarRoomResponse {
    id: string;
    topic: string;
    timestamp: string;
}

export interface IncineratorResponse {
    roastSummary: string;
    survivalScore: number; // 0-100
    feedback: string[];
    rewrittenContent?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: AgentId;
    status: TaskStatus;
    priority: TaskPriority;
    estimatedTime: string;
    createdAt: string;
    completedAt?: string;
}

export interface TacticalPlan {
    goal: string;
    tasks: Task[];
    createdAt: string;
    completedAt?: string;
}

export interface BusinessContext {
    founderName: string;
    companyName: string;
    industry: string;
    description: string;
    // Financials (merged from DB schema)
    currentCash?: number;
    monthlyBurn?: number;
    monthlyRevenue?: number;
    growthRate?: number;
}

// BRAND DNA (THE CODEX)
export interface BrandTone {
    formalVsCasual: number; // 0-100
    playfulVsSerious: number; // 0-100
    modernVsClassic: number; // 0-100
}

export interface TargetPersona {
    name: string;
    description: string;
    painPoints: string[];
}

export interface BrandDNA {
    tone: BrandTone;
    personas: TargetPersona[];
    coreValues: string[];
    bannedWords: string[];
}

export interface DailyBriefing {
    date: string;
    summary: string;
    focusPoints: string[];
    threatAlerts: string[];
    motivationalQuote: string;
}

// FINANCE
export interface FinancialContext {
    currentCash: number;
    monthlyBurn: number;
    monthlyRevenue: number;
    growthRate: number; // percentage
}

export interface FinancialAudit {
    runwayScore: number; // 0-100
    verdict: string;
    strategicMoves: string[];
    riskFactors: string[];
}

// GAMIFICATION TYPES
export interface UserProgress {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    rankTitle: string;
    totalActions: number;
}

export interface ToastMessage {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'xp';
    xpAmount?: number;
}

// CREATIVE STUDIO
export interface CreativeAsset {
    id: string;
    prompt: string;
    style: string;
    imageBase64: string;
    createdAt: string;
}

// PITCH DECK
export interface Slide {
    title: string;
    keyPoint: string;
    content: string[];
    visualIdea: string;
}

export interface PitchDeck {
    id: string;
    title: string;
    slides: Slide[];
    generatedAt: string;
}

// THE MAINFRAME (CTO)
export interface TechStackAudit {
    score: number; // 0-100
    verdict: string;
    pros: string[];
    cons: string[];
    recommendations: string[];
}

export interface CodeSnippet {
    language: string;
    code: string;
    explanation: string;
}

export interface SavedCodeSnippet extends CodeSnippet {
    id: string;
    title: string; // Usually the user prompt or first line
    generatedAt: string;
}

// THE SIMULATOR
export interface ScenarioOutcome {
    title: string;
    probability: number; // 0-100
    timeline: string; // e.g. "3 Months"
    description: string;
    keyEvents: string[];
}

export interface SimulationResult {
    id: string;
    query: string;
    likelyCase: ScenarioOutcome;
    bestCase: ScenarioOutcome;
    worstCase: ScenarioOutcome;
    strategicAdvice: string;
    timestamp: string;
}

// THE NETWORK (CRM)
export type ContactCategory = 'investor' | 'lead' | 'partner' | 'media' | 'vip';

export interface Contact {
    id: string;
    name: string;
    role: string;
    company: string;
    category: ContactCategory;
    email: string;
    notes: string;
    lastContact?: string;
    aiAnalysis?: string;
}

export interface NegotiationPrep {
    strategy: string;
    leveragePoints: string[];
    psychologicalProfile: string;
    openingLine: string;
}

// THE IRONCLAD (LEGAL)
export interface LegalAnalysis {
    safetyScore: number; // 0-100
    verdict: string;
    criticalRisks: string[];
    suggestions: string[];
}

export type LegalDocType = 'NDA' | 'Contractor Agreement' | 'SaaS Terms of Service' | 'Privacy Policy' | 'Offer Letter';

// THE BOARDROOM
export interface DepartmentGrade {
    agentId: AgentId;
    department: string;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    score: number; // 0-100
    summary: string;
    keyIssue: string;
}

export interface BoardMeetingReport {
    id: string;
    date: string;
    ceoScore: number; // 0-100
    executiveSummary: string;
    grades: DepartmentGrade[];
    consensus: string;
}

// THE PIVOT (BLUE OCEAN STRATEGY)
export interface MarketGap {
    name: string;
    description: string;
    competitionScore: number; // 0-100 (Low is better)
    profitabilityScore: number; // 0-100 (High is better)
    soloFitScore: number; // 0-100 (High is better)
    whyItWorks: string;
    firstStep: string;
}

export interface PivotAnalysis {
    currentIndustry: string;
    gaps: MarketGap[];
}

// THE SANCTUARY (MENTAL OPS)
export interface MentalState {
    mood: string;
    stressLevel: number; // 0-100
    primaryBlocker: string;
}

export interface MentalCoaching {
    reframing: string;
    stoicQuote: string;
    actionableStep: string;
    breathingExercise: boolean;
}

// THE ARCHITECT (PRODUCT SPECS)
export interface ProductFeature {
    name: string;
    userStory: string; // "As a user I want..."
    acceptanceCriteria: string[];
    techNotes: string;
}

export interface ProductSpec {
    id: string;
    featureName: string;
    summary: string;
    features: ProductFeature[];
    dataModel: string[]; // Rough schema description
    generatedAt: string;
}

// THE ACADEMY (TRAINING SIM)
export interface RoleplayScenario {
    id: string;
    title: string;
    description: string;
    difficulty: 'ROOKIE' | 'VETERAN' | 'NIGHTMARE';
    opponentRole: string;
    opponentPersona: string;
    objective: string;
}

export interface RoleplayTurn {
    role: 'user' | 'opponent';
    text: string;
}

export interface RoleplayFeedback {
    score: number;
    strengths: string[];
    weaknesses: string[];
    proTip: string;
}

// THE TRIBE (COMMUNITY)
export interface CommunityManifesto {
    title: string;
    enemy: string; // The "Anti-Persona" or status quo
    belief: string; // The core belief
    tagline: string;
}

export interface CommunityRitual {
    name: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Onboarding';
    description: string;
    action: string;
}

export interface TribeBlueprint {
    manifesto: CommunityManifesto;
    rituals: CommunityRitual[];
    engagementLoops: string[];
    id: string;
    generatedAt: string;
}

// THE AMPLIFIER (CONTENT REPURPOSING)
export interface ContentAmplification {
    id: string;
    sourceTitle: string;
    twitterThread: string[]; // Array of tweets
    linkedinPost: string;
    tiktokScript: string; // Visual + Audio direction
    newsletterSection: string;
    generatedAt: string;
}

export interface SocialStrategy {
    id: string;
    pillars: { title: string; description: string; }[];
    cadence: string;
    personaTactics: { persona: string; tactic: string; }[];
    sampleHooks: string[];
    generatedAt: string;
}

// THE LAUNCHPAD (GTM)
export interface LaunchEvent {
    day: string; // e.g. "T-Minus 7"
    title: string;
    description: string;
    owner: AgentId;
    channel: string;
}

export interface LaunchStrategy {
    id: string;
    productName: string;
    launchDate: string;
    phases: {
        name: string; // Pre-Launch, Liftoff, Orbit
        events: LaunchEvent[];
    }[];
    generatedAt: string;
}

// THE SCOUT (HR & DELEGATION)
export interface JobDescription {
    id: string;
    roleTitle: string;
    hook: string;
    responsibilities: string[];
    requirements: string[];
    perks: string[];
    generatedAt: string;
}

export interface InterviewQuestion {
    question: string;
    whatToLookFor: string; // The "Green Flag"
    redFlag: string;
}

export interface InterviewGuide {
    id: string;
    roleTitle: string;
    questions: InterviewQuestion[];
    generatedAt: string;
}

export interface SOPStep {
    step: number;
    action: string;
    details: string;
}

export interface SOP {
    id: string;
    taskName: string;
    goal: string;
    steps: SOPStep[];
    successCriteria: string;
    generatedAt: string;
}