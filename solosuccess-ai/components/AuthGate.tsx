import { useStackApp, useUser } from "@stackframe/stack";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const app = useStackApp();
    const user = useUser();

    useEffect(() => {
        // If no user is signed in, redirect to sign in page
        if (user === null) {
            app.redirectToSignIn();
        }
    }, [user, app]);

    // Show loading while checking auth status
    if (user === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // User is not authenticated
    if (user === null) {
        return null; // Will redirect via useEffect
    }

    // User is authenticated, render children
    return <>{children}</>;
}
