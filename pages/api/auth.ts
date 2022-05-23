import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'lib/db/supabaseclient';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    supabase.auth.api.setAuthCookie(req, res);
};

export default handler;