import { useAtomValue } from 'jotai';
import { descriptionAtom, shaderDataUrlThumbAtom, titleAtom } from 'lib/atoms/atoms';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function MetaHead() {
    const [ogUrl, setOgUrl] = useState('');

    useEffect(() => {
        setOgUrl(window.location.href);
    }, []);

    return (
        <Head>
            <title>compute.toys</title>
            <meta name="og:url" content={ogUrl} />
            <meta property="og:type" content="image" />
            <meta property="og:site_name" content="@compute.toys" />
            <meta property="og:title" content={useAtomValue(titleAtom)} />
            <meta property="og:description" content={useAtomValue(descriptionAtom)} />
            <meta property="og:image" content={useAtomValue(shaderDataUrlThumbAtom)} />
            <meta name="twitter:url" content={ogUrl} />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:site:id" content="@compute_toys" />
            <meta name="twitter:title" content={useAtomValue(titleAtom)} />
            <meta name="twitter:description" content={useAtomValue(descriptionAtom)} />
            <meta name="twitter:image" content={useAtomValue(shaderDataUrlThumbAtom)} />
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
