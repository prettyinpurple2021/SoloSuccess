import { StackProvider, StackTheme } from "@stackframe/stack";
import { ReactNode } from "react";

const stackTheme: StackTheme = {
    colors: {
        // Match your app's glassmorphism/dark theme
        primaryBackground: "rgba(30, 30, 30, 0.95)",
        secondaryBackground: "rgba(40, 40, 40, 0.9)",
        primaryText: "#ffffff",
        secondaryText: "#a0aec0",
        primaryBorder: "rgba(255, 255, 255, 0.1)",
        accent: "#805ad5", // Purple accent to match your theme
        error: "#fc8181",
    },
};

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <StackProvider
            projectId={(import.meta as any).env?.VITE_STACK_PROJECT_ID || ""}
            publishableClientKey={(import.meta as any).env?.VITE_STACK_PUBLISHABLE_CLIENT_KEY || ""}
            theme={stackTheme}
        >
            {children}
        </StackProvider>
    );
}
