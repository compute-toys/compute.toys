// https://www.misha.wtf/blog/nextjs-supabase-auth
import {createContext, useContext, useEffect, useState} from 'react';
import {supabase, SUPABASE_PROFILE_TABLE_NAME} from "lib/supabaseclient";
import {AuthChangeEvent, Session, User} from "@supabase/gotrue-js";

export const EVENTS = {
    SIGNED_IN: 'SIGNED_IN',
    SIGNED_OUT: 'SIGNED_OUT',
    USER_UPDATED: 'USER_UPDATED',
    TOKEN_REFRESHED: 'TOKEN_REFRESHED'
};

export interface ProfileData {
    username: string | false,
    avatar: string | false
}



// obviously redundant but typescript will treat reference to
// VIEWS as a namespace here and fail to find it
export type View = 'logged_in' | 'logged_out';
export type EmailOTPType = "signup" | "recovery";

export const VIEWS = {
    LOGGED_IN: 'logged_in' as View,
    LOGGED_OUT: 'logged_out' as View
};

export type AuthLogIn = (email: string, password: string) => Promise<{error: any}>;
export type AuthLogOut = () => Promise<{error: any}>;
export type AuthSignUp = (email: string, username: string, password: string) => Promise<{error: any}>;
export type AuthConfirm = (email: string, token: string, type: EmailOTPType) => Promise<{error: any}>;
export type AuthResetPassword = (email: string) => Promise<{error: any}>;
export type AuthUpdatePassword = (password: string) => Promise<{error: any}>;


// TODO: better error types
export interface AuthContextInterface {
    user: User | null,
    view: View,
    session: Session | null,
    profile: ProfileData,
    logIn: AuthLogIn,
    logOut: AuthLogOut,
    signUp: AuthSignUp,
    confirm: AuthConfirm,
    resetPassword: AuthResetPassword,
    updatePassword: AuthUpdatePassword
}

export const AuthContext = createContext<AuthContextInterface>(undefined);

async function updateSupabaseCookie(event: AuthChangeEvent, session: Session | null) {
    await fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session }),
    });
}

async function logInApi(username: string, password: string) {
    return await fetch('/api/login', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
    });
}

async function signUpApi(email: string, username: string, password: string) {
    return await fetch('/api/signup', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ email, username, password }),
    });
}

async function confirmApi(email: string, token: string, type: EmailOTPType) {
    return await fetch('/api/confirm', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ email, token, type }),
    });
}

//https://github.com/supabase/supabase/blob/master/examples/nextjs-ts-user-management/components/Account.tsx
const uploadAvatar = async (file: File, user: User): Promise<{avatar, error}> => {
    let error = undefined;
    try {
        if (file.size > (50 * 1024)) {
            error = {message: 'Please select an image that is less than 50KB'};
            return {avatar: undefined, error: error};
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/avatar.${fileExt}`
        const filePath = `${fileName}`

        let { error: uploadError } = await supabase.storage
            .from('avatar')
            .upload(filePath, file, {upsert: true})

        if (uploadError) {
            error = {message: 'Error uploading image: ' + uploadError.message};
            return {avatar: undefined, error: error};
        }

        let { error: updateError } = await supabase.from('profile').upsert({
            id: user!.id,
            avatar_url: filePath,
        })

        if (updateError) {
            error = {message: 'Error updating profile image after upload: ' + updateError.message};
            return {avatar: undefined, error: error};
        }

        return {avatar: filePath, error: error};
    } catch (error) {
        return {avatar: undefined, error: error};
    }
}

const getProfileApi = async (user: User, view: string) => {
    if (user && view && view !== VIEWS.LOGGED_OUT) {
        return supabase
            .from(SUPABASE_PROFILE_TABLE_NAME)
            .select(`username, avatar_url`)
            .eq('id', user.id)
            .single()
            .then( ({data, error, status}) => {
                if ((error && status !== 406) || !data) {
                    return {username: false, avatar: false};
                } else {
                    return {username: data.username, avatar: data.avatar_url};
                }
            });
    } else {
        return Promise.resolve({username: false, avatar: false});
    }
}

export const AuthProvider = ({ ...props }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState(null);
    const [view, setView] = useState<View>(VIEWS.LOGGED_OUT);
    const [profile, setProfile] = useState<ProfileData>({username: false, avatar: false});

    const logIn = async (email: string, password: string) => {
        return await supabase.auth.signIn({email, password})
            .then(({session, user, error}) => {
                if (error) {
                    throw new Error(error.message)
                } else {
                    return session;
                }
            })
            .then(_session => {
                setSession(_session);
                return {error: undefined}
            })
            .catch((error) => {
                return {error: error};
            });
    }

    const signUp = async (email: string, username: string, password: string) : Promise<{ error }> => {
        return await signUpApi(email, username, password)
            .then((res) => {
                if (!res.ok) {
                    return res.json().then(res => {throw new Error(res.error)});
                } else {
                    return res.json();
                }
            })
            .then(data => {
                return { error: undefined};
            })
            .catch((err) => {
                return {error: {message: err.message}}
            });
    }

    const confirm = async (email: string, token: string, type: EmailOTPType) : Promise<{ error }> => {
        return await confirmApi(email, token, type)
            .then((res) => {
                if (!res.ok) {
                    return res.json().then(res => {throw new Error(res.error)});
                } else {
                    return res.json();
                }
            })
            .then(async data => {
                // seems really backwards since we already have the session,
                // but this seems to be the only documented way to do this
                const {user, session, error} = await supabase.auth.signIn({
                    refreshToken: data.session.refresh_token,
                });

                if (error) {
                    throw new Error(error.message);
                } else {
                    return {error: undefined};
                }
            })
            .catch((err) => {
                return {error: {message: err.message}}
            });
    }

    const resetPassword = async (email: string) : Promise<{ error }> => {
        return await supabase.auth.api
            .resetPasswordForEmail(email)
        .then(({data, error}) => {
            if (error) {
                return {error: error.message};
            } else {
                return {error: undefined};
            }
        });
    }

    const updatePassword = async (password: string) : Promise<{ error }> => {
        return await supabase.auth.api
            .updateUser(session.access_token, { password : password })
            .then(({data, error}) => {
                if (error) {
                    return {error: error.message};
                } else {
                    return {error: undefined};
                }
            });
    }

    const logOut = () => supabase.auth.signOut();

    useEffect(() => {
        if (session) {
            setUser((session as Session).user ?? null);
        } else {
            setUser(null);
        }
    }, [session]);

    useEffect(() => {
        if (user) {
            setView(VIEWS.LOGGED_IN);
        } else {
            setView(VIEWS.LOGGED_OUT);
        }
    }, [user]);


    useEffect(() => {
        getProfileApi(user, view).then((res : ProfileData) => {
            setProfile(res);
        })
    }, [user, view]);

    useEffect(() => {
        setSession(supabase.auth.session());

        const { data: authListener } = supabase.auth.onAuthStateChange((event, _session) => {
            setSession(_session);
            updateSupabaseCookie(event, _session);
        });

        return () => {
            authListener?.unsubscribe();
        };
    });

    return (
        <AuthContext.Provider
            value={{
                user: user,
                view: view,
                session: session,
                profile: profile,
                logIn: logIn,
                logOut: logOut,
                signUp: signUp,
                confirm: confirm,
                resetPassword: resetPassword,
                updatePassword: updatePassword
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