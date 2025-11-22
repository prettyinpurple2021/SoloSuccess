
import { GoogleGenAI, Type } from "@google/genai";
import { AgentId, CompetitorReport, WarRoomResponse, IncineratorResponse, Task, BusinessContext, DailyBriefing, FinancialContext, FinancialAudit, PitchDeck, BrandDNA, TechStackAudit, CodeSnippet, SimulationResult, Contact, NegotiationPrep, LegalAnalysis, LegalDocType, BoardMeetingReport, PivotAnalysis, MentalState, MentalCoaching, ProductSpec, RoleplayScenario, RoleplayTurn, RoleplayFeedback, TribeBlueprint, ContentAmplification, LaunchStrategy, JobDescription, InterviewGuide, SOP, SocialStrategy } from "../types";
import { SYSTEM_INSTRUCTIONS, AGENTS } from "../constants";
import { storageService } from "./storageService";
import { apiService } from "./apiService";

// PRODUCTION CONFIGURATION
// Set VITE_USE_BACKEND_PROXY=true in .env.local to use the secure backend proxy
const USE_BACKEND_PROXY = (import.meta as any).env?.VITE_USE_BACKEND_PROXY === 'true';
const apiKey = (process as any).env?.API_KEY || '';

if (USE_BACKEND_PROXY) {
    console.log('🔒 Using secure backend proxy for AI generation');
} else {
    console.log('⚠️ Using client-side SDK (development mode only)');
}

const getContext = async (): Promise<string> => {
    // PRODUCTION NOTE: Now using storageService (which could be backend-backed).
    const ctx = await storageService.getContext();
    const dna = await storageService.getBrandDNA();

    if (!ctx) return "";

    let dnaContext = "";

    if (dna) {
        dnaContext = `
        === BRAND DNA (THE CODEX) ===
        TONE SETTINGS:
        - Casualness: ${dna.tone.formalVsCasual}% (0=Formal, 100=Casual)
        - Playfulness: ${dna.tone.playfulVsSerious}% (0=Serious, 100=Playful)
        - Modernity: ${dna.tone.modernVsClassic}% (0=Classic, 100=Modern)
        
        TARGET AUDIENCE:
        ${dna.personas.map(p => `- ${p.name}: ${p.description}`).join('\n')}
        
        CORE VALUES: ${dna.coreValues.join(', ')}
        BANNED WORDS: ${dna.bannedWords.join(', ')}
        `;
    }

    return `
    CONTEXT_AWARENESS_LAYER:
    You are working for: "${ctx.companyName}"
    Founder: "${ctx.founderName}"
    Industry: "${ctx.industry}"
    Description: "${ctx.description}"
    
    ${dnaContext}

    Tailor ALL responses to this specific business context and BRAND DNA.
    `;
};

const getDeepMindContext = async (): Promise<string> => {
    // PRODUCTION NOTE: Aggregating data via storageService.

    // 1. Tasks (Tactical Roadmap)
    const tasks = await storageService.getTasks();
    let tasksContext = "NO ACTIVE TASKS.";

    if (tasks.length > 0) {
        const activeTasks = tasks
            .filter(t => t.status !== 'done')
            .sort((a, b) => (a.priority === 'high' ? -1 : 1)) // High priority first
            .slice(0, 10); // Top 10 only to save tokens

        if (activeTasks.length > 0) {
            tasksContext = activeTasks.map(t =>
                `- [${t.priority.toUpperCase()}] ${t.title} (Assignee: ${t.assignee.toUpperCase()}, Status: ${t.status})`
            ).join('\n');
        }
    }

    // 2. Intel (Competitor Stalker)
    const reports = await storageService.getCompetitorReports();
    let intelContext = "NO INTELLIGENCE REPORTS.";

    if (reports.length > 0) {
        const recentReports = reports.slice(0, 5); // Top 5 most recent
        intelContext = recentReports.map(r =>
            `- ${r.competitorName}: Threat Level ${r.threatLevel}. Vulnerabilities: ${r.vulnerabilities.slice(0, 2).join(', ')}`
        ).join('\n');
    }

    return `
    === DEEP MIND / SYSTEM DATA LAYER ===
    The following is REAL-TIME data from the user's dashboard. Use this to answer questions intelligently.
    
    [ACTIVE TACTICAL OPS / TASKS]
    ${tasksContext}

    [GATHERED INTELLIGENCE / COMPETITORS]
    ${intelContext}
    =====================================
    `;
};

export const getAgentResponse = async (
    agentId: AgentId,
    history: { role: 'user' | 'model', text: string }[],
    newMessage: string
): Promise<string> => {
    const businessContext = await getContext();
    const deepMindContext = await getDeepMindContext();
    const systemInstruction = await storageService.getSystemInstructions(agentId) || SYSTEM_INSTRUCTIONS[agentId];

    const fullSystemInstruction = `
        ${systemInstruction}
        
        ${businessContext}
        
        ${deepMindContext}
        
        INSTRUCTIONS:
        - You have full visibility into the user's "Tasks" and "Competitor Intel" listed above.
        - If the user asks "What should I do?", reference the high-priority tasks.
        - If the user asks about strategy, reference the competitor vulnerabilities.
        - Do not explicitly mention "Deep Mind" or "System Data Layer" unless asked; just act like you know this info naturally.
    `;

    // PRODUCTION: Use backend proxy when enabled
    if (USE_BACKEND_PROXY) {
        try {
            const text = await apiService.generate({
                prompt: newMessage,
                systemInstruction: fullSystemInstruction,
                model: 'gemini-2.5-flash',
                history,
                temperature: 0.8
            });
            return text || "No response generated.";
        } catch (error) {
            console.error("Backend Proxy Error:", error);
            return "Connection lost. The agent is currently offline.";
        }
    }

    // DEVELOPMENT: Use client-side SDK (fallback)
    if (!apiKey) {
        return "ERR: NO_API_KEY_DETECTED. Please configure your environment.";
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.8,
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const result = await chat.sendMessage({ message: newMessage });
        return result.text || "No response generated.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Connection lost. The agent is currently offline.";
    }
};

export const generateCompetitorReport = async (competitorName: string, agentId: AgentId): Promise<CompetitorReport | null> => {
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const agent = AGENTS[agentId];
    const context = await getContext();
    const persona = await storageService.getSystemInstructions(agentId) || SYSTEM_INSTRUCTIONS[agentId];

    const prompt = `
      ${context}
      
      Generate a classified intelligence dossier for the competitor: "${competitorName}".
      
      You are acting as ${agent.name}, the ${agent.title}.
      Your core persona: ${persona}

      MISSION:
      Analyze this competitor specifically through your unique lens.
      
      OUTPUT REQUIREMENTS:
      1. Determine a threat level (LOW, MEDIUM, HIGH, CRITICAL).
      2. Provide a mission brief.
      3. List key intel points, vulnerabilities, and strengths.
      4. SCORE them (0-100) on:
         - Innovation (Tech/Novelty)
         - Market Presence (Brand/Reach)
         - UX (User Experience/Design)
         - Pricing (Value/Aggressiveness)
         - Velocity (Speed of shipping)
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        competitorName: { type: Type.STRING },
                        threatLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                        missionBrief: { type: Type.STRING },
                        intel: { type: Type.ARRAY, items: { type: Type.STRING } },
                        vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        metrics: {
                            type: Type.OBJECT,
                            properties: {
                                innovation: { type: Type.NUMBER },
                                marketPresence: { type: Type.NUMBER },
                                ux: { type: Type.NUMBER },
                                pricing: { type: Type.NUMBER },
                                velocity: { type: Type.NUMBER }
                            },
                            required: ['innovation', 'marketPresence', 'ux', 'pricing', 'velocity']
                        }
                    },
                    required: ['competitorName', 'threatLevel', 'missionBrief', 'intel', 'vulnerabilities', 'strengths', 'metrics']
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No text returned");

        const data = JSON.parse(text);
        return {
            ...data,
            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error("Report Generation Error:", error);
        return null;
    }
};

export const generateWarRoomDebate = async (topic: string): Promise<WarRoomResponse | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const deepMindContext = await getDeepMindContext();
    const prompt = `${context}\n${deepMindContext}\nThe user has convened "The War Room" to discuss: "${topic}". Simulate a debate between Roxy, Echo, Lexi, Glitch. Return JSON with dialogue, consensus, and actionPlan.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dialogue: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { speaker: { type: Type.STRING }, text: { type: Type.STRING } } } },
                        consensus: { type: Type.STRING },
                        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) { return null; }
};

export const generateIncineratorFeedback = async (content: string, mode: 'roast' | 'forge', brutality: number): Promise<IncineratorResponse | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nIncinerator Mode. Content: "${content}". Mode: ${mode}. Brutality: ${brutality}. Return JSON with roastSummary, survivalScore, feedback, rewrittenContent.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { roastSummary: { type: Type.STRING }, survivalScore: { type: Type.NUMBER }, feedback: { type: Type.ARRAY, items: { type: Type.STRING } }, rewrittenContent: { type: Type.STRING } } } }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) { return null; }
};

export const generateTacticalPlan = async (goal: string): Promise<Task[] | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nGoal: "${goal}". Break into tasks for Roxy, Echo, Lexi, Glitch. Return JSON array of tasks.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, assignee: { type: Type.STRING }, priority: { type: Type.STRING }, estimatedTime: { type: Type.STRING } } } } }
        });
        const tasks = JSON.parse(response.text || '[]');
        return tasks.map((t: any, i: number) => ({ ...t, id: `task-${Date.now()}-${i}`, status: 'todo', createdAt: new Date().toISOString() }));
    } catch (error) { return null; }
};

export const generateDailyBriefing = async (): Promise<DailyBriefing | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const deepMind = await getDeepMindContext();
    const prompt = `${context}\n${deepMind}\nGenerate Daily Briefing. Return JSON with summary, focusPoints, threatAlerts, motivationalQuote.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, summary: { type: Type.STRING }, focusPoints: { type: Type.ARRAY, items: { type: Type.STRING } }, threatAlerts: { type: Type.ARRAY, items: { type: Type.STRING } }, motivationalQuote: { type: Type.STRING } } } } });
        return { ...JSON.parse(response.text || '{}'), date: new Date().toLocaleDateString() };
    } catch (e) { return null; }
};

export const generateMarketPulse = async (): Promise<{ content: string, sources: any[] } | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nSearch for market trends/news for this industry. Summary bullet points.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] } });
        const grounding = response.candidates?.[0]?.groundingMetadata;
        const sources = grounding?.groundingChunks?.map((c: any) => c.web).filter((w: any) => w) || [];
        return { content: response.text || "", sources };
    } catch (e) { return null; }
};

export const generateBrandImage = async (promptUser: string, styleDesc: string): Promise<string | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nImage Gen: ${promptUser}. Style: ${styleDesc}.`;
    try {
        const response = await ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt, config: { numberOfImages: 1, aspectRatio: '16:9', outputMimeType: 'image/jpeg' } });
        const b64 = response.generatedImages?.[0]?.image?.imageBytes;
        return b64 ? `data:image/jpeg;base64,${b64}` : null;
    } catch (e) { return null; }
};

export const generatePitchDeck = async (): Promise<PitchDeck | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nGenerate 10-slide pitch deck. Return JSON with title, slides (title, keyPoint, content, visualIdea).`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, slides: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keyPoint: { type: Type.STRING }, content: { type: Type.ARRAY, items: { type: Type.STRING } }, visualIdea: { type: Type.STRING } } } } } } } });
        return { ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() };
    } catch (e) { return null; }
};

export const generateFinancialAudit = async (financials: FinancialContext): Promise<FinancialAudit | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Audit these financials: ${JSON.stringify(financials)}. Return JSON with runwayScore, verdict, strategicMoves, riskFactors.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { runwayScore: { type: Type.NUMBER }, verdict: { type: Type.STRING }, strategicMoves: { type: Type.ARRAY, items: { type: Type.STRING } }, riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } } } } } });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateTechAudit = async (stack: string): Promise<TechStackAudit | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Audit tech stack: ${stack}. Return JSON with score, verdict, pros, cons, recommendations.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, verdict: { type: Type.STRING }, pros: { type: Type.ARRAY, items: { type: Type.STRING } }, cons: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendations: { type: Type.ARRAY, items: { type: Type.STRING } } } } } });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateCodeSolution = async (problem: string): Promise<CodeSnippet | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Solve coding problem: ${problem}. Return JSON with language, code, explanation.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { language: { type: Type.STRING }, code: { type: Type.STRING }, explanation: { type: Type.STRING } } } } });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const runSimulation = async (scenario: string): Promise<SimulationResult | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Simulate scenario: ${scenario}. Return JSON with likelyCase, bestCase, worstCase, strategicAdvice.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { likelyCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, bestCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, worstCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, strategicAdvice: { type: Type.STRING } } } } });
        return { id: `sim-${Date.now()}`, query: scenario, timestamp: new Date().toISOString(), ...JSON.parse(response.text || '{}') };
    } catch (e) { return null; }
};

export const generateColdEmail = async (contact: Contact): Promise<string | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nDraft cold email for ${contact.name}, ${contact.role} at ${contact.company}. Notes: ${contact.notes}.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "text/plain" } });
        return response.text || null;
    } catch (e) { return null; }
};

export const generateNegotiationPrep = async (contact: Contact): Promise<NegotiationPrep | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nNegotiation prep for ${contact.name}. Return JSON with strategy, leveragePoints, psychologicalProfile, openingLine.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { strategy: { type: Type.STRING }, leveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } }, psychologicalProfile: { type: Type.STRING }, openingLine: { type: Type.STRING } } } } });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const draftLegalDoc = async (type: LegalDocType, details: string): Promise<string | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const persona = await storageService.getSystemInstructions(AgentId.LUMI) || SYSTEM_INSTRUCTIONS[AgentId.LUMI];
    const prompt = `${context}\n${persona}\nDraft ${type}. Details: ${details}. Include strict standard legal disclaimer that this is AI generated.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "text/plain" } });
        return response.text || null;
    } catch (e) { return null; }
};

export const analyzeContract = async (text: string): Promise<LegalAnalysis | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const persona = await storageService.getSystemInstructions(AgentId.LUMI) || SYSTEM_INSTRUCTIONS[AgentId.LUMI];
    const prompt = `${context}\n${persona}\nAnalyze contract: ${text.substring(0, 20000)}. Return JSON with safetyScore, verdict, criticalRisks, suggestions.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { safetyScore: { type: Type.NUMBER }, verdict: { type: Type.STRING }, criticalRisks: { type: Type.ARRAY, items: { type: Type.STRING } }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } } } } });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateBoardMeetingReport = async (fin: FinancialContext, tasks: Task[], reports: CompetitorReport[], contacts: Contact[]): Promise<BoardMeetingReport | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = getContext();

    const dataSummary = `
    FINANCIALS: Cash ${fin.currentCash}, Burn ${fin.monthlyBurn}, Revenue ${fin.monthlyRevenue}.
    OPS: ${tasks.length} total tasks, ${tasks.filter((t: any) => t.status === 'done').length} completed.
    INTEL: ${reports.length} competitors tracked.
    NETWORK: ${contacts.length} key contacts.
    `;

    const prompt = `${context}\nGenerate Board Meeting Report based on data: ${dataSummary}. Return JSON.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { ceoScore: { type: Type.NUMBER }, executiveSummary: { type: Type.STRING }, consensus: { type: Type.STRING }, grades: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { agentId: { type: Type.STRING }, department: { type: Type.STRING }, grade: { type: Type.STRING }, score: { type: Type.NUMBER }, summary: { type: Type.STRING }, keyIssue: { type: Type.STRING } } } } } } } });
        return { ...JSON.parse(response.text || '{}'), id: `board-${Date.now()}`, date: new Date().toISOString() };
    } catch (e) { return null; }
};

export const findBlueOceans = async (): Promise<PivotAnalysis | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nFind 3 Blue Ocean market gaps. Return JSON.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { currentIndustry: { type: Type.STRING }, gaps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, competitionScore: { type: Type.NUMBER }, profitabilityScore: { type: Type.NUMBER }, soloFitScore: { type: Type.NUMBER }, whyItWorks: { type: Type.STRING }, firstStep: { type: Type.STRING } } } } } } } });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateStoicCoaching = async (state: MentalState): Promise<MentalCoaching | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Stoic coaching for: Mood ${state.mood}, Stress ${state.stressLevel}, Blocker ${state.primaryBlocker}. Return JSON.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { reframing: { type: Type.STRING }, stoicQuote: { type: Type.STRING }, actionableStep: { type: Type.STRING }, breathingExercise: { type: Type.BOOLEAN } } } } });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateProductSpec = async (idea: string): Promise<ProductSpec | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nGenerate PRD for "${idea}". Return JSON.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { featureName: { type: Type.STRING }, summary: { type: Type.STRING }, features: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, userStory: { type: Type.STRING }, acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }, techNotes: { type: Type.STRING } } } }, dataModel: { type: Type.ARRAY, items: { type: Type.STRING } } } } } });
        return { ...JSON.parse(response.text || '{}'), id: `spec-${Date.now()}`, generatedAt: new Date().toISOString() };
    } catch (e) { return null; }
};

export const getRoleplayReply = async (scenario: RoleplayScenario, history: RoleplayTurn[], userInput: string): Promise<string> => {
    if (!apiKey) return "Error";
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Roleplay: ${scenario.title}. Role: ${scenario.opponentRole}. History: ${JSON.stringify(history)}. User: ${userInput}. Respond in character.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "text/plain" } });
        return response.text || "...";
    } catch (e) { return "Error"; }
};

export const evaluateRoleplaySession = async (scenario: RoleplayScenario, history: RoleplayTurn[]): Promise<RoleplayFeedback | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Evaluate roleplay session. Scenario: ${scenario.title}. History: ${JSON.stringify(history)}. Return JSON with score, strengths, weaknesses, proTip.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, proTip: { type: Type.STRING } } } } });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateTribeBlueprint = async (audience: string, enemy: string): Promise<TribeBlueprint | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nGenerate Tribe Blueprint. Audience: ${audience}. Enemy: ${enemy}. Return JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        manifesto: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                enemy: { type: Type.STRING },
                                belief: { type: Type.STRING },
                                tagline: { type: Type.STRING }
                            }
                        },
                        rituals: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    frequency: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    action: { type: Type.STRING }
                                }
                            }
                        },
                        engagementLoops: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return { ...JSON.parse(response.text || '{}'), id: `tribe-${Date.now()}`, generatedAt: new Date().toISOString() };
    } catch (e) { return null; }
};

export const generateAmplifiedContent = async (source: string): Promise<ContentAmplification | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nAmplify content: "${source}". Return JSON with sourceTitle, twitterThread, linkedinPost, tiktokScript, newsletterSection.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { sourceTitle: { type: Type.STRING }, twitterThread: { type: Type.ARRAY, items: { type: Type.STRING } }, linkedinPost: { type: Type.STRING }, tiktokScript: { type: Type.STRING }, newsletterSection: { type: Type.STRING } } } } });
        return { ...JSON.parse(response.text || '{}'), id: `amp-${Date.now()}`, generatedAt: new Date().toISOString() };
    } catch (e) { return null; }
};

export const generateSocialStrategy = async (): Promise<SocialStrategy | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `
        ${context}
        
        MISSION: SOCIAL STRATEGY (The Amplifier)
        Act as Echo (CMO).
        
        Analyze the Brand DNA provided in the context.
        Generate a high-level social media strategy tailored to the target personas.
        
        Return JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pillars: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            }
                        },
                        cadence: { type: Type.STRING },
                        personaTactics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    persona: { type: Type.STRING },
                                    tactic: { type: Type.STRING }
                                }
                            }
                        },
                        sampleHooks: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['pillars', 'cadence', 'personaTactics', 'sampleHooks']
                }
            }
        });

        return {
            id: `strat-${Date.now()}`,
            generatedAt: new Date().toISOString(),
            ...JSON.parse(response.text || '{}')
        };

    } catch (error) {
        console.error("Social Strategy Error:", error);
        return null;
    }
};

export const generateLaunchStrategy = async (product: string, date: string): Promise<LaunchStrategy | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();
    const prompt = `${context}\nLaunch Strategy for "${product}" on ${date}. Return JSON with phases (name, events(day, title, description, owner, channel)).`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { productName: { type: Type.STRING }, launchDate: { type: Type.STRING }, phases: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, events: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, owner: { type: Type.STRING }, channel: { type: Type.STRING } } } } } } } } } } });
        return { ...JSON.parse(response.text || '{}'), id: `launch-${Date.now()}`, generatedAt: new Date().toISOString() };
    } catch (e) { return null; }
};

export const generateJobDescription = async (roleTitle: string, employmentType: string): Promise<JobDescription | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();

    const prompt = `
        ${context}
        
        MISSION: HIRE TALENT (The Scout)
        ROLE: "${roleTitle}"
        TYPE: "${employmentType}"

        Act as Roxy (Ops Lead). Create a high-converting Job Description.
        
        1. Hook: A catchy opening line that filters for the right attitude.
        2. Responsibilities: Clear, actionable bullet points.
        3. Requirements: Must-have skills vs. nice-to-haves.
        4. Perks: Why a talented person should join a solo founder's mission.
        
        Return JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        roleTitle: { type: Type.STRING },
                        hook: { type: Type.STRING },
                        responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                        requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        perks: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['roleTitle', 'hook', 'responsibilities', 'requirements', 'perks']
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No text returned");
        const data = JSON.parse(text);
        return {
            id: `jd-${Date.now()}`,
            generatedAt: new Date().toISOString(),
            ...data
        };

    } catch (error) {
        console.error("JD Error:", error);
        return null;
    }
};

export const generateInterviewGuide = async (roleTitle: string, keyFocus: string): Promise<InterviewGuide | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();

    const prompt = `
        ${context}
        
        MISSION: VET TALENT
        ROLE: "${roleTitle}"
        FOCUS: "${keyFocus}"

        Act as Roxy (Ops) & Glitch (Tech/Skill). Create an Interview Guide.
        
        Generate 5 Killer Questions.
        For each question, define:
        1. The Question itself (Behavioral or Technical).
        2. "What to Look For" (Green Flags/Good Signs).
        3. "Red Flags" (Warning Signs).
        
        Return JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        roleTitle: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    whatToLookFor: { type: Type.STRING },
                                    redFlag: { type: Type.STRING }
                                },
                                required: ['question', 'whatToLookFor', 'redFlag']
                            }
                        }
                    },
                    required: ['roleTitle', 'questions']
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No text returned");
        const data = JSON.parse(text);
        return {
            id: `interview-${Date.now()}`,
            generatedAt: new Date().toISOString(),
            ...data
        };

    } catch (error) {
        console.error("Interview Gen Error:", error);
        return null;
    }
};

export const generateSOP = async (taskName: string): Promise<SOP | null> => {
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const context = await getContext();

    const prompt = `
        ${context}
        
        MISSION: DELEGATION SYSTEM (SOP)
        TASK: "${taskName}"

        Act as Roxy (Ops). Turn this task into a bulletproof Standard Operating Procedure (SOP) for a Virtual Assistant.
        
        1. Define the Goal.
        2. Break it down into numbered Steps (Action + Details).
        3. Define "Definition of Done" (Success Criteria).
        
        Return JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        taskName: { type: Type.STRING },
                        goal: { type: Type.STRING },
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    step: { type: Type.NUMBER },
                                    action: { type: Type.STRING },
                                    details: { type: Type.STRING }
                                },
                                required: ['step', 'action', 'details']
                            }
                        },
                        successCriteria: { type: Type.STRING }
                    },
                    required: ['taskName', 'goal', 'steps', 'successCriteria']
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No text returned");
        const data = JSON.parse(text);
        return {
            id: `sop-${Date.now()}`,
            generatedAt: new Date().toISOString(),
            ...data
        };

    } catch (error) {
        console.error("SOP Error:", error);
        return null;
    }
};