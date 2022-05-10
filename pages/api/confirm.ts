import {NextApiRequest, NextApiResponse} from "next";
import {supabase} from "lib/supabaseclient";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const {email, token} = req.body;

    const { user, session, error } = await supabase.auth.verifyOTP(
        {
            email: email,
            token: token,
            type: "signup"
        }
    )

    if (!error) {
        return res.status(200).json({
            user: user,
            session: session
        });
    }

    return res.status(400).json({
        error: "Invalid confirmation code",
    });
};

export default handler;