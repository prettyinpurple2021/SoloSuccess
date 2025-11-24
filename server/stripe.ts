// Stripe Integration Setup
import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-11-17.clover',
});

// Price IDs for each tier (set these after creating products in Stripe dashboard)
export const PRICE_IDS = {
    starter: process.env.STRIPE_STARTER_PRICE_ID || '',
    professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
    empire: process.env.STRIPE_EMPIRE_PRICE_ID || '',
};

// Tier limits for feature gating
export const TIER_LIMITS = {
    starter: {
        businesses: 1,
        aiGenerations: 200, // per month
        competitors: 3,
        features: ['core', 'agents', 'basic_tools']
    },
    professional: {
        businesses: 3,
        aiGenerations: -1, // unlimited
        competitors: -1, // unlimited
        features: ['core', 'agents', 'basic_tools', 'advanced_tools', 'email_integration', 'forecasting']
    },
    empire: {
        businesses: -1, // unlimited
        aiGenerations: -1,
        competitors: -1,
        features: ['all', 'api_access', 'team_collaboration', 'whitelabel', 'custom_training']
    }
};

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: number): Promise<string> {
    // TODO: Query subscriptions table
    // For now, return 'starter' as default
    return 'starter';
}

/**
 * Check if user can access a feature
 */
export async function canAccessFeature(userId: number, feature: string): Promise<boolean> {
    const tier = await getUserTier(userId);
    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];

    if (!limits) return false;

    return limits.features.includes(feature) || limits.features.includes('all');
}

/**
 * Check if user has exceeded usage limits
 */
export async function checkUsageLimit(
    userId: number,
    type: 'aiGenerations' | 'competitors' | 'businesses'
): Promise<{ allowed: boolean; limit: number; current: number }> {
    const tier = await getUserTier(userId);
    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];

    const limit = limits[type];

    // -1 means unlimited
    if (limit === -1) {
        return { allowed: true, limit: -1, current: 0 };
    }

    // TODO: Query usage_tracking table for current usage
    const current = 0; // Placeholder

    return {
        allowed: current < limit,
        limit,
        current
    };
}
