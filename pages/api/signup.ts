import { supabase } from 'lib/db/supabaseclient';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { email, username, password } = req.body;

    const { user, session, error } = await supabase.auth.signUp(
        {
            email: email,
            password: password
        },
        {
            data: {
                username: username
            }
        }
    );

    if (!error) {
        return res.status(200).json({
            user: user
        });
    }

    return res.status(404).json({
        error: 'Invalid username or password'
    });
};

export default handler;
