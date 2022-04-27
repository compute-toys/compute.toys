import { useEffect, useState } from 'react'
import {supabase, SUPABASE_AVATAR_STORAGE_BUCKET_URL_POSTFIX} from '../lib/supabaseclient'
import Image from 'next/image';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Avatar({ url, size, displayOnNull}: { url: string | null; size: number; displayOnNull?: boolean }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        // https://ihjewugoxadlugnrohdd.supabase.co/storage/v1/object/public/avatar/9f8d7791-84bc-4a38-a6fa-d34bbe2b6fa10.42976325890173617.jpg
        if (url) {
            setAvatarUrl(process.env.NEXT_PUBLIC_SUPABASE_URL + SUPABASE_AVATAR_STORAGE_BUCKET_URL_POSTFIX + url);
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