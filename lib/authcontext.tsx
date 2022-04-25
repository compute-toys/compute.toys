// https://www.misha.wtf/blog/nextjs-supabase-auth
import {ChangeEvent, createContext, useContext, useEffect, useState} from 'react';
import {supabase} from "./supabaseclient";

export const EVENTS = {
    SIGNED_IN: 'SIGNED_IN',
    SIGNED_OUT: 'SIGNED_OUT',
    USER_UPDATED: 'USER_UPDATED',
    TOKEN_REFRESHED: 'TOKEN_REFRESHED'
};

export const VIEWS = {
    LOGGED_IN: 'logged_in',
    LOGGED_OUT: 'logged_out'
};

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ supabase, ...props }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [view, setView] = useState(VIEWS.LOGGED_OUT);
    const [username, setUsername] = useState(null);
    const [avatar, setAvatar] = useState(null);

    const checkUsername = async () => {
        if (view === VIEWS.LOGGED_OUT) {
            setUsername(null);
            setAvatar(null);
            return;
        }
        try {
            let { data, error, status } = await supabase
                .from('profile')
                .select(`username, avatar_url`)
                .eq('id', user.id)
                .single();
            if ((error && status !== 406) || !data) {
                setUsername(null);
                setAvatar(null);
            } else {
                setUsername(data.username);
                setAvatar(data.avatar_url);
            }
        } catch (error) {}
    }

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
    }, [view])

    return (
        <AuthContext.Provider
            value={{
                user: user,
                view: view,
                session: session,
                logOut: () => supabase.auth.signOut(),
                username: username,
                avatar: avatar
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