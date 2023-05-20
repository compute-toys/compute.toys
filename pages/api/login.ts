import { supabase } from 'lib/db/supabaseclient';
import { supabasePrivileged } from 'lib/db/supabaseprivilegedclient';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username, password } = req.body;
    const { data } = await supabasePrivileged.from('user').select().eq('username', username);

    if (data.length > 0) {
        const { session, error } = await supabase.auth.signIn({
            email: data[0].email,
            password
        });
        if (!error) {
            return res.status(200).json({
                session: session
            });
        }
    }
    return res.status(404).json({
        message: 'Invalid username or password'
    });
};

export default handler;
