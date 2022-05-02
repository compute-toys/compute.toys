import { useEffect, useState } from 'react'
import {SUPABASE_AVATAR_BUCKET_NAME} from 'lib/supabaseclient'
import Image from 'next/image';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {getFullyQualifiedSupabaseBucketURL} from "lib/urlutils";

export default function Avatar({ url, size, displayOnNull, verbatim}: { url: string | null | false; size: number; displayOnNull?: boolean; verbatim?: boolean }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (url) {
            if (!verbatim) {
                setAvatarUrl(getFullyQualifiedSupabaseBucketURL(SUPABASE_AVATAR_BUCKET_NAME, url));
            } else {
                setAvatarUrl(url);
            }
        } else {
            setAvatarUrl(null);
        }
    }, [url])

    const displayNull = typeof displayOnNull !== 'undefined' && displayOnNull;

    return avatarUrl ? (
        <Image src={avatarUrl} alt={"avatar"} style={{borderRadius: '15px'}} width={size} height={size}/>
    ) : (
        displayNull ? <AccountCircleIcon style={{ height: size, width: size }}/> : null
    );
}