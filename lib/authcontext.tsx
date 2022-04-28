// https://www.misha.wtf/blog/nextjs-supabase-auth
import {createContext, useContext, useEffect} from 'react';
import {supabase} from "lib/supabaseclient";
import {useAtom, useAtomValue} from "jotai";
import {profileAtom, sessionAtom, userAtom, viewAtom} from "lib/loginatoms";
import {AuthChangeEvent, Session} from "@supabase/gotrue-js";

export const EVENTS = {
    SIGNED_IN: 'SIGNED_IN',
    SIGNED_OUT: 'SIGNED_OUT',
    USER_UPDATED: 'USER_UPDATED',
    TOKEN_REFRESHED: 'TOKEN_REFRESHED'
};


export const AuthContext = createContext(undefined);

async function updateSupabaseCookie(event: AuthChangeEvent, session: Session | null) {
    await fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session }),
    });
}

export const AuthProvider = ({ ...props }) => {
    const [session, setSession] = useAtom(sessionAtom);
    const user = useAtomValue(userAtom);
    const view = useAtomValue(viewAtom);
    const profile = useAtomValue(profileAtom);


    useEffect(() => {
        setSession(true);

        const { data: authListener } = supabase.auth.onAuthStateChange((event, _session) => {
            updateSupabaseCookie(event, _session);
            setSession(_session);
        });

        return () => {
            authListener?.unsubscribe();
        };
    });

    /*
    useEffect(() => {
        const activeSession = supabase.auth.session();
        const user = activeSession?.user;
        setSession(activeSession);
        setUser(user ?? null);
        setView( user ? VIEWS.LOGGED_IN : VIEWS.LOGGED_OUT);

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, currentSession) => {
                setSession(currentSession);
                setUser(user ?? null);

                switch (event) {
                    case EVENTS.SIGNED_OUT:
                    case EVENTS.USER_UPDATED:
                        setView(VIEWS.LOGGED_OUT);
                        break;
                    case EVENTS.SIGNED_IN:
                    case EVENTS.TOKEN_REFRESHED:
                        setView(VIEWS.LOGGED_IN);
                        break;
                    default:
                }
            }
        );

        return () => {
            authListener?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        checkUsername();
    }, [view])*/

    return (
        <AuthContext.Provider
            value={[
                user,
                view,
                session,
                () => setSession(false),
                profile
            ]}
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