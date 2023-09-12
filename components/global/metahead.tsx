import { useAtomValue } from 'jotai';
import { descriptionAtom, thumbUrlAtom, titleAtom } from 'lib/atoms/atoms';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function MetaHead() {
    const [url, setUrl] = useState('');
    const title = useAtomValue(titleAtom);
    const description = useAtomValue(descriptionAtom);
    const thumbUrl = useAtomValue(thumbUrlAtom);

    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    return (
        <Head>
            <title>{title}</title>
            <meta name="og:url" content={url} />
            <meta property="og:type" content="image" />
            <meta property="og:site_name" content="@compute.toys" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={thumbUrl} />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site:id" content="@compute_toys" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={thumbUrl} />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
            <meta name="msapplication-TileColor" content="#da532c" />
            <meta name="theme-color" content="#ffffff" />
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
    );
}
