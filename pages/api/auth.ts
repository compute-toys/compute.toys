import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'lib/supabaseclient';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    supabase.auth.api.setAuthCookie(req, res);
};

export default handler;