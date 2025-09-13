// Client-side auth actions for Vite (replacing Next.js server actions)

import { createClient } from 'lib/supabase/client';

export async function login(email: string) {
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOtp({ email });
    
    if (error) {
        throw error;
    }
    
    // Redirect to OTP page
    const encodedEmail = encodeURIComponent(email);
    window.location.href = `/login/otp?email=${encodedEmail}`;
}

export async function verify(email: string, token: string) {
    const supabase = createClient();
    
    const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
    });
    
    if (error) {
        throw error;
    }
    
    // Redirect to home
    window.location.href = '/list/1';
}

export async function logout() {
    const supabase = createClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        throw error;
    }
    
    // Redirect to home
    window.location.href = '/list/1';
}