'use server';

import { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from 'lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const supabase = await createClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string
    };

    const { error } = await supabase.auth.signInWithOtp(data);

    if (error) {
        redirect('/error');
    }

    // revalidatePath('/', 'layout');

    const email = encodeURIComponent(data.email);
    redirect(`/login/otp?email=${email}`);
}

export async function verify(formData: FormData) {
    const supabase = await createClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        token: formData.get('token') as string,
        type: 'email' as EmailOtpType
    };

    const { error } = await supabase.auth.verifyOtp(data);

    if (error) {
        redirect('/error');
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

export async function logout() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        redirect('/error');
    }

    revalidatePath('/', 'layout');
    redirect('/');
}
