// Storage Service - Production Version
// Now uses backend APIs with localStorage as offline fallback

import {
    UserProgress, Task, ChatMessage, CompetitorReport, BusinessContext, BrandDNA,
    PitchDeck, CreativeAsset, Contact, LaunchStrategy, TribeBlueprint,
    SOP, JobDescription, InterviewGuide, ProductSpec, PivotAnalysis,
    BoardMeetingReport, SavedCodeSnippet, SavedWarRoomSession, LegalDocType,
    RoleplayFeedback, ContentAmplification, SimulationResult
} from '../types';

// Configuration
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
const USE_BACKEND = (import.meta as any).env?.VITE_USE_BACKEND_STORAGE !== 'false'; // Default to true

const DELAY = 50;
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY));

// Storage Keys for localStorage fallback
const KEYS = {
    PROGRESS: 'solo_user_progress',
    TASKS: 'solo_tactical_tasks',
    CONTEXT: 'solo_business_context',
    REPORTS: 'solo_competitor_reports',
    BRAND_DNA: 'solo_brand_dna',
    PITCH_DECKS: 'solo_pitch_decks',
    CREATIVE_ASSETS: 'solo_creative_assets',
    CONTACTS: 'solo_contacts',
    LAUNCH_STRATEGIES: 'solo_launch_strategies',
    TRIBE_BLUEPRINTS: 'solo_tribe_blueprints',
    SOPS: 'solo_sops',
    JOB_DESCRIPTIONS: 'solo_job_descriptions',
    INTERVIEW_GUIDES: 'solo_interview_guides',
    PRODUCT_SPECS: 'solo_product_specs',
    PIVOT_ANALYSES: 'solo_pivot_analyses',
    BOARD_REPORTS: 'solo_board_reports',
    CODE_SNIPPETS: 'solo_code_snippets',
    WAR_ROOM_SESSIONS: 'solo_war_room_sessions',
    LEGAL_DOCS: 'solo_legal_docs',
    TRAINING_HISTORY: 'solo_training_history',
    CHAT_PREFIX: 'solo_chat_history_'
};

// ===== HELPER FUNCTIONS =====

// Generic Get/Set for localStorage fallback
const get = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
        console.error(`Error reading ${key}`, e);
        return defaultVal;
    }
};

const set = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error writing ${key}`, e);
    }
};

// API helper with fallback and authentication
async function apiCall<T>(
    method: string,
    endpoint: string,
    body?: any,
    fallbackKey?: string,
    fallbackValue?: T
): Promise<T> {
    if (!USE_BACKEND) {
        await delay();
        if (fallbackKey) {
            if (body !== undefined && (method === 'POST' || method === 'PUT')) {
                set(fallbackKey, body);
                return body as T;
            }
            return get<T>(fallbackKey, fallbackValue as T);
        }
        throw new Error('Backend disabled and no fallback key provided');
    }

    try {
        // Get Stack Auth user ID
        const stackApp = (window as any).stackApp;
        const userId = stackApp?.user?.id || '';

        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-stack-user-id': userId, // Pass user ID to backend
            }
        };

        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache in localStorage for offline fallback
        if (fallbackKey && data) {
            set(fallbackKey, data);
        }

        return data as T;
    } catch (error) {
        console.warn(`API call failed, using localStorage fallback:`, error);
        // Fallback to localStorage
        if (fallbackKey) {
            return get<T>(fallbackKey, fallbackValue as T);
        }
        throw error;
    }
}

// ===== SERVICE EXPORTS =====

export const storageService = {
    // --- User Progress ---
    async getUserProgress(): Promise<UserProgress> {
        const defaultProgress: UserProgress = {
            level: 1, currentXP: 0, nextLevelXP: 100, rankTitle: 'Garage Hacker', totalActions: 0
        };

        try {
            const user = await apiCall<any>('GET', '/api/user', undefined, KEYS.PROGRESS, defaultProgress);
            // Map backend user to UserProgress format
            return {
                level: user.level || 1,
                currentXP: user.xp || 0,
                nextLevelXP: user.nextLevelXP || 100,
                rankTitle: user.rankTitle || 'Garage Hacker',
                totalActions: user.totalActions || 0
            };
        } catch (error) {
            return defaultProgress;
        }
    },

    async saveUserProgress(progress: UserProgress): Promise<void> {
        await apiCall('POST', '/api/user/progress', {
            xp: progress.currentXP,
            level: progress.level,
            totalActions: progress.totalActions
        }, KEYS.PROGRESS, progress);
    },

    // --- Tasks ---
    async getTasks(): Promise<Task[]> {
        return apiCall<Task[]>('GET', '/api/tasks', undefined, KEYS.TASKS, []);
    },

    async saveTasks(tasks: Task[]): Promise<void> {
        await apiCall('POST', '/api/tasks/batch', tasks, KEYS.TASKS, tasks);
    },

    async addTask(task: Task): Promise<void> {
        await apiCall('POST', '/api/tasks', task, KEYS.TASKS);
        // Also update cache
        const tasks = await this.getTasks();
        tasks.unshift(task);
        set(KEYS.TASKS, tasks);
    },

    async updateTask(taskId: string, updates: Partial<Task>): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        await this.saveTasks(updated);
        return updated;
    },

    async deleteTask(taskId: string): Promise<void> {
        await apiCall('DELETE', `/api/tasks/${taskId}`);
        const tasks = await this.getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        set(KEYS.TASKS, filtered);
    },

    async clearTasks(): Promise<void> {
        await apiCall('DELETE', '/api/tasks');
        set(KEYS.TASKS, []);
    },

    // --- Chat History ---
    async getChatHistory(agentId: string): Promise<ChatMessage[]> {
        try {
            const history = await apiCall<any[]>('GET', `/api/chat/${agentId}`, undefined, `${KEYS.CHAT_PREFIX}${agentId}`, []);
            // Map backend format to ChatMessage
            return history.map(h => ({
                role: h.role,
                text: h.text,
                timestamp: parseInt(h.timestamp)
            }));
        } catch (error) {
            return [];
        }
    },

    async saveChatHistory(agentId: string, messages: ChatMessage[]): Promise<void> {
        await apiCall('POST', '/api/chat', { agentId, messages }, `${KEYS.CHAT_PREFIX}${agentId}`, messages);
    },

    async clearChatHistory(agentId: string): Promise<void> {
        await apiCall('POST', '/api/chat', { agentId, messages: [] }, `${KEYS.CHAT_PREFIX}${agentId}`, []);
        localStorage.removeItem(`${KEYS.CHAT_PREFIX}${agentId}`);
    },

    // --- Business Context ---
    async getContext(): Promise<BusinessContext | null> {
        return apiCall<BusinessContext | null>('GET', '/api/context', undefined, KEYS.CONTEXT, null);
    },

    async saveContext(context: BusinessContext): Promise<void> {
        await apiCall('POST', '/api/context', context, KEYS.CONTEXT, context);
    },

    // --- Brand DNA ---
    async getBrandDNA(): Promise<BrandDNA | null> {
        return get<BrandDNA | null>(KEYS.BRAND_DNA, null);
    },

    async saveBrandDNA(dna: BrandDNA): Promise<void> {
        await delay();
        set(KEYS.BRAND_DNA, dna);
    },

    // --- Competitor Reports ---
    async getCompetitorReports(): Promise<CompetitorReport[]> {
        return apiCall<CompetitorReport[]>('GET', '/api/reports', undefined, KEYS.REPORTS, []);
    },

    async saveCompetitorReport(report: CompetitorReport): Promise<void> {
        await apiCall('POST', '/api/reports', report, KEYS.REPORTS);
        const reports = await this.getCompetitorReports();
        reports.unshift(report);
        set(KEYS.REPORTS, reports);
    },

    // --- Pitch Decks (localStorage only for now) ---
    async getPitchDecks(): Promise<PitchDeck[]> {
        await delay();
        return get<PitchDeck[]>(KEYS.PITCH_DECKS, []);
    },

    async savePitchDeck(deck: PitchDeck): Promise<void> {
        const decks = await this.getPitchDecks();
        const index = decks.findIndex(d => d.id === deck.id);
        if (index >= 0) {
            decks[index] = deck;
        } else {
            decks.unshift(deck);
        }
        await delay();
        set(KEYS.PITCH_DECKS, decks);
    },

    // --- Creative Assets ---
    async getCreativeAssets(): Promise<CreativeAsset[]> {
        await delay();
        return get<CreativeAsset[]>(KEYS.CREATIVE_ASSETS, []);
    },

    async saveCreativeAsset(asset: CreativeAsset): Promise<void> {
        const assets = await this.getCreativeAssets();
        assets.unshift(asset);
        await delay();
        set(KEYS.CREATIVE_ASSETS, assets);
    },

    // --- Contacts ---
    async getContacts(): Promise<Contact[]> {
        await delay();
        return get<Contact[]>(KEYS.CONTACTS, []);
    },

    async saveContact(contact: Contact): Promise<void> {
        const contacts = await this.getContacts();
        const index = contacts.findIndex(c => c.id === contact.id);
        if (index >= 0) {
            contacts[index] = contact;
        } else {
            contacts.push(contact);
        }
        await delay();
        set(KEYS.CONTACTS, contacts);
    },

    // --- Launch Strategies ---
    async getLaunchStrategies(): Promise<LaunchStrategy[]> {
        await delay();
        return get<LaunchStrategy[]>(KEYS.LAUNCH_STRATEGIES, []);
    },

    async saveLaunchStrategy(strategy: LaunchStrategy): Promise<void> {
        const items = await this.getLaunchStrategies();
        items.unshift(strategy);
        await delay();
        set(KEYS.LAUNCH_STRATEGIES, items);
    },

    // --- Tribe Blueprints ---
    async getTribeBlueprints(): Promise<TribeBlueprint[]> {
        await delay();
        return get<TribeBlueprint[]>(KEYS.TRIBE_BLUEPRINTS, []);
    },

    async saveTribeBlueprint(blueprint: TribeBlueprint): Promise<void> {
        const items = await this.getTribeBlueprints();
        items.unshift(blueprint);
        await delay();
        set(KEYS.TRIBE_BLUEPRINTS, items);
    },

    // --- SOPs & HR ---
    async getSOPs(): Promise<SOP[]> {
        await delay();
        return get<SOP[]>(KEYS.SOPS, []);
    },

    async saveSOP(sop: SOP): Promise<void> {
        const items = await this.getSOPs();
        items.unshift(sop);
        await delay();
        set(KEYS.SOPS, items);
    },

    async getJobDescriptions(): Promise<JobDescription[]> {
        await delay();
        return get<JobDescription[]>(KEYS.JOB_DESCRIPTIONS, []);
    },

    async saveJobDescription(jd: JobDescription): Promise<void> {
        const items = await this.getJobDescriptions();
        items.unshift(jd);
        await delay();
        set(KEYS.JOB_DESCRIPTIONS, items);
    },

    async getInterviewGuides(): Promise<InterviewGuide[]> {
        await delay();
        return get<InterviewGuide[]>(KEYS.INTERVIEW_GUIDES, []);
    },

    async saveInterviewGuide(guide: InterviewGuide): Promise<void> {
        const items = await this.getInterviewGuides();
        items.unshift(guide);
        await delay();
        set(KEYS.INTERVIEW_GUIDES, items);
    },

    // --- Product Specs ---
    async getProductSpecs(): Promise<ProductSpec[]> {
        await delay();
        return get<ProductSpec[]>(KEYS.PRODUCT_SPECS, []);
    },

    async saveProductSpec(spec: ProductSpec): Promise<void> {
        const items = await this.getProductSpecs();
        items.unshift(spec);
        await delay();
        set(KEYS.PRODUCT_SPECS, items);
    },

    async saveProductSpecs(specs: ProductSpec[]): Promise<void> {
        await delay();
        set(KEYS.PRODUCT_SPECS, specs);
    },

    // --- Pivot Analyses ---
    async getPivotAnalyses(): Promise<PivotAnalysis[]> {
        await delay();
        return get<PivotAnalysis[]>(KEYS.PIVOT_ANALYSES, []);
    },

    async savePivotAnalysis(analysis: PivotAnalysis): Promise<void> {
        const items = await this.getPivotAnalyses();
        items.unshift(analysis);
        await delay();
        set(KEYS.PIVOT_ANALYSES, items);
    },

    // --- Board Reports ---
    async getBoardReports(): Promise<BoardMeetingReport[]> {
        await delay();
        return get<BoardMeetingReport[]>(KEYS.BOARD_REPORTS, []);
    },

    async saveBoardReport(report: BoardMeetingReport): Promise<void> {
        const items = await this.getBoardReports();
        items.unshift(report);
        await delay();
        set(KEYS.BOARD_REPORTS, items);
    },

    // --- Code Snippets ---
    async getCodeSnippets(): Promise<SavedCodeSnippet[]> {
        await delay();
        return get<SavedCodeSnippet[]>(KEYS.CODE_SNIPPETS, []);
    },

    async saveCodeSnippet(snippet: SavedCodeSnippet): Promise<void> {
        const items = await this.getCodeSnippets();
        items.unshift(snippet);
        await delay();
        set(KEYS.CODE_SNIPPETS, items);
    },

    // --- War Room ---
    async getWarRoomSessions(): Promise<SavedWarRoomSession[]> {
        await delay();
        return get<SavedWarRoomSession[]>(KEYS.WAR_ROOM_SESSIONS, []);
    },

    async saveWarRoomSession(session: SavedWarRoomSession): Promise<void> {
        const items = await this.getWarRoomSessions();
        items.unshift(session);
        await delay();
        set(KEYS.WAR_ROOM_SESSIONS, items);
    },

    // --- Legal Docs ---
    async getLegalDocs(): Promise<any[]> {
        await delay();
        return get<any[]>(KEYS.LEGAL_DOCS, []);
    },

    async saveLegalDoc(doc: any): Promise<void> {
        const items = await this.getLegalDocs();
        items.unshift(doc);
        await delay();
        set(KEYS.LEGAL_DOCS, items);
    },

    // --- Training History ---
    async getTrainingHistory(): Promise<RoleplayFeedback[]> {
        await delay();
        return get<RoleplayFeedback[]>(KEYS.TRAINING_HISTORY, []);
    },

    async saveTrainingResult(result: RoleplayFeedback): Promise<void> {
        const items = await this.getTrainingHistory();
        items.unshift(result);
        await delay();
        set(KEYS.TRAINING_HISTORY, items);
    },

    // --- System Instructions ---
    async getSystemInstructions(agentId: string): Promise<string | null> {
        await delay();
        return get<string | null>(`solo_agent_prompt_${agentId}`, null);
    },

    // --- System Management ---
    async clearAll(): Promise<void> {
        await delay();
        localStorage.clear();
    },

    async exportData(): Promise<Record<string, any>> {
        await delay();
        const allData: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('solo_')) {
                allData[key] = localStorage.getItem(key);
            }
        }
        return allData;
    },

    async importData(data: Record<string, any>): Promise<void> {
        await delay();
        Object.keys(data).forEach(key => {
            if (key.startsWith('solo_')) {
                localStorage.setItem(key, data[key]);
            }
        });
    },

    // --- Campaigns (The Amplifier) ---
    async getCampaigns(): Promise<ContentAmplification[]> {
        await delay();
        return get<ContentAmplification[]>('solo_campaigns', []);
    },

    async saveCampaign(campaign: ContentAmplification): Promise<void> {
        const items = await this.getCampaigns();
        items.unshift(campaign);
        await delay();
        set('solo_campaigns', items);
    },

    // --- Simulations (The Simulator) ---
    async getSimulations(): Promise<SimulationResult[]> {
        await delay();
        return get<SimulationResult[]>('solo_simulations', []);
    },

    async saveSimulation(simulation: SimulationResult): Promise<void> {
        const items = await this.getSimulations();
        items.unshift(simulation);
        await delay();
        set('solo_simulations', items);
    }
};

console.log(`📦 Storage Service: ${USE_BACKEND ? '✅ Using backend database' : '⚠️ Using localStorage only'}`);
