// https://www.misha.wtf/blog/nextjs-supabase-auth
import { createContext, useContext, useEffect, useState } from 'react';

export const EVENTS = {
    SIGNED_IN: 'SIGNED_IN',
    SIGNED_OUT: 'SIGNED_OUT',
    USER_UPDATED: 'USER_UPDATED',
};

export const VIEWS = {
    LOG_IN: 'log_in',
    LOG_OUT: 'log_out'
};

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ supabase, ...props }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [view, setView] = useState(VIEWS.LOG_IN);

    useEffect(() => {
        const activeSession = supabase.auth.session();
        setSession(activeSession);
        setUser(activeSession?.user ?? null);

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, currentSession) => {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                switch (event) {
                    case EVENTS.SIGNED_OUT:
                    case EVENTS.USER_UPDATED:
                        setView(VIEWS.LOG_IN);
                        break;
                    case EVENTS.SIGNED_IN:
                        setView(VIEWS.LOG_OUT);
                        break;
                    default:
                }
            }
        );

        return () => {
            authListener?.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                view,
                session,
                signOut: () => supabase.auth.signOut(),
            }}
            {...props}
        />
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};