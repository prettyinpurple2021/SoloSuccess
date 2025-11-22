import { UserProgress, ToastMessage } from "../types";
import { storageService } from "./storageService";



const RANKS = [
    { level: 1, title: "Garage Hacker" },
    { level: 5, title: "Bootstrapped Believer" },
    { level: 10, title: "Seed Stage Strategist" },
    { level: 20, title: "Series A Architect" },
    { level: 35, title: "Market Disruptor" },
    { level: 50, title: "Unicorn Visionary" },
    { level: 75, title: "Industry Titan" },
    { level: 100, title: "IPO God" }
];

const BASE_XP = 100;
const EXPONENT = 1.5;

export const getLevelFromXP = (xp: number) => {
    return Math.floor(Math.pow(xp / BASE_XP, 1 / EXPONENT)) + 1;
};

export const getXPForLevel = (level: number) => {
    return Math.floor(BASE_XP * Math.pow(level - 1, EXPONENT));
};

export const getRankTitle = (level: number) => {
    const rank = [...RANKS].reverse().find(r => level >= r.level);
    return rank ? rank.title : RANKS[0].title;
};

export const getUserProgress = async (): Promise<UserProgress> => {
    // PRODUCTION NOTE: Now using abstracted StorageService
    const data = await storageService.getUserProgress();

    // Recalculate derived values just in case (though storage usually has raw data)
    // But here we are storing the full object in storageService for simplicity in the mock.
    // Actually storageService.getUserProgress returns the full object with derived fields if we saved them.
    // But let's stick to the logic: XP is the source of truth.

    const level = getLevelFromXP(data.currentXP || 0); // Handle potential missing field if format changed
    const nextLevelXP = getXPForLevel(level + 1);

    return {
        level,
        currentXP: data.currentXP || 0,
        nextLevelXP,
        rankTitle: getRankTitle(level),
        totalActions: data.totalActions || 0
    };
};

export const addXP = async (amount: number): Promise<{ progress: UserProgress, leveledUp: boolean }> => {
    const current = await getUserProgress();
    const newXP = current.currentXP + amount;

    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > current.level;

    const newData: UserProgress = {
        ...current,
        currentXP: newXP,
        level: newLevel,
        totalActions: current.totalActions + 1,
        rankTitle: getRankTitle(newLevel),
        nextLevelXP: getXPForLevel(newLevel + 1)
    };

    // PRODUCTION NOTE: Update progress in database via service.
    await storageService.saveUserProgress(newData);

    return {
        progress: newData,
        leveledUp
    };
};

// Simple Event Bus for Toasts
type ToastListener = (toast: ToastMessage) => void;
let listeners: ToastListener[] = [];

export const subscribeToToasts = (listener: ToastListener) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
};

export const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'xp' = 'info', xpAmount?: number) => {
    const toast: ToastMessage = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        type,
        xpAmount
    };
    listeners.forEach(l => l(toast));
};