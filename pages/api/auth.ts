import { supabase } from 'lib/db/supabaseclient';
import { NextApiRequest, NextApiResponse } from 'next';

export const runtime = 'edge';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    supabase.auth.api.setAuthCookie(req, res);
};

export default handler;
