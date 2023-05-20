import { supabase } from 'lib/db/supabaseclient';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    supabase.auth.api.setAuthCookie(req, res);
};

export default handler;
