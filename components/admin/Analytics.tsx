import React from 'react';
import { SubscriptionMetrics } from './SubscriptionMetrics';

export function Analytics() {
    // For now, reuse subscription metrics as the main overview
    // In the future, this can include more general platform stats
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Platform Overview</h2>
                <p className="text-zinc-400">Real-time insights into platform performance and growth.</p>
            </div>
            <SubscriptionMetrics />
        </div>
    );
}
