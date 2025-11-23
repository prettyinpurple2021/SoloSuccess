import { StackProvider, StackClientApp, useStackApp } from "@stackframe/stack";
import { ReactNode, useEffect } from "react";

// Initialize Stack Client App
const stackClientApp = new StackClientApp({
    projectId: (import.meta as any).env?.VITE_STACK_PROJECT_ID || "",
    publishableClientKey: (import.meta as any).env?.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "",
});

function StackAppExposer({ children }: { children: ReactNode }) {
    const app = useStackApp();

    useEffect(() => {
        // Expose Stack App globally for storageService to access user ID
        (window as any).stackApp = app;
    }, [app]);

    return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <StackProvider app={stackClientApp}>
            <StackAppExposer>
                {children}
            </StackAppExposer>
        </StackProvider>
    );
}

export { stackClientApp };
