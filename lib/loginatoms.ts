// Using 'false' here to satisfy type checker for Jotai's function overloads
import {atom} from "jotai";
import {Session, User} from "@supabase/gotrue-js";
import {supabase} from "./supabaseclient";

const isSSR = typeof window === "undefined";

export const VIEWS = {
    LOGGED_IN: 'logged_in',
    LOGGED_OUT: 'logged_out'
};

export interface ProfileData {
    username: string | false,
    avatar: string | false
}

export const sessionAtom = atom<Promise<Session | false>, boolean, void>(
    new Promise<false>((resolve, reject) => resolve(false)),
    async (get, set, log_in) => {
        let session;
        if (log_in) {
            session = supabase.auth.session() ?? false;
        } else {
            await supabase.auth.signOut();
            session = false;
        }
        set(sessionAtom, session);
    }
);

export const userAtom = atom<User | false>((get) => {
    if (get(sessionAtom) !== false) {
        return get(sessionAtom)["user"];
    } else {
        return false;
    }
});

export const viewAtom = atom<string>((get) => {
    if (get(userAtom) !== false) {
        return VIEWS.LOGGED_IN;
    } else {
        return VIEWS.LOGGED_OUT
    }
});

export const profileAtom = atom<Promise<ProfileData>>(async (get) => {
    if (!isSSR && get(userAtom) !== false && get(viewAtom) !== VIEWS.LOGGED_OUT) {
        let { data, error, status } = await supabase
            .from('profile')
            .select(`username, avatar_url`)
            .eq('id', get(userAtom)["id"])
            .single();
        if ((error && status !== 406) || !data) {
            return {username: false, avatar: false};
        } else {
            return {username: data.username, avatar: data.avatar_url};
        }
    } else {
        return {username: false, avatar: false};
    }
});