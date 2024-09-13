import { supabase } from 'lib/db/supabaseclient';
import { NextApiRequest, NextApiResponse } from 'next';

export const runtime = 'edge';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { email, token, type } = req.body;

    const {
        data: { user, session },
        error
    } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: type
    });

    if (!error) {
        return res.status(200).json({
            user: user,
            session: session
        });
    }

    return res.status(400).json({
        error: 'Invalid confirmation code'
    });
};

export default handler;
