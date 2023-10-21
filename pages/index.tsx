import '@fontsource/lobster';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from 'components/global/avatar';
import FakeLink from 'components/global/fakelink';
import Logo from 'components/global/logo';
import 'firacode';
import { supabase, SUPABASE_SHADERTHUMB_BUCKET_NAME } from 'lib/db/supabaseclient';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { Item, theme } from 'theme/theme';
import { SHADER_THUMB_SIZE_H, SHADER_THUMB_SIZE_V } from './list/[page]';

const NewSubmissionBar = props => {
    return (
        <ImageList
            gap={10}
            sx={{ width: SHADER_THUMB_SIZE_H * 2.1 }}
            cols={2}
            rowHeight={SHADER_THUMB_SIZE_V}
        >
            {props.shaders.map(shader => (
                <ImageListItem key={shader.id}>
                    <Image
                        style={{ borderRadius: '4px' }}
                        src={getFullyQualifiedSupabaseBucketURL(
                            SUPABASE_SHADERTHUMB_BUCKET_NAME,
                            shader.thumb_url
                        )}
                        alt={shader.name}
                        width={SHADER_THUMB_SIZE_H}
                        height={SHADER_THUMB_SIZE_V}
                        priority={true}
                    />
                    <ImageListItemBar
                        title={<Link href={`/view/${shader.id}`}>{shader.name}</Link>}
                        subtitle={
                            <div>
                                <span>by </span>
                                <FakeLink href={`/profile/${shader.profile.username}`}>
                                    {shader.profile.username}
                                </FakeLink>
                            </div>
                        }
                        style={{ borderRadius: '4px' }}
                        actionIcon={
                            <FakeLink href={`/profile/${shader.profile.username}`}>
                                <Box sx={{ margin: '10px' }}>
                                    <Avatar url={shader.profile.avatar_url} size={25} />
                                </Box>
                            </FakeLink>
                        }
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
};

const style = {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '16px',
    width: '1050px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    color: theme.palette.dracula.foreground
};

export default function Home(props) {
    if (props.error) console.error(props.error);

    return (
        <Fragment>
            <Alert variant={'outlined'} severity="warning" sx={{ marginTop: '1em' }}>
                <Typography variant={'subtitle1'} color={theme.palette.neutral.contrastText}>
                    <Logo /> is an experimental editor for{' '}
                    <a href="https://developer.chrome.com/articles/gpu-compute/">
                        WebGPU compute shaders
                    </a>
                    . At this time, only <a href={'https://www.google.com/chrome/'}>Chrome</a> (
                    <a href="https://developer.chrome.com/blog/webgpu-release/">v113+</a>) is
                    supported, as{' '}
                    <a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status">
                        WebGPU is not yet fully supported by other browsers
                    </a>
                    .
                </Typography>
            </Alert>
            <Item sx={style}>
                <Grid container spacing={2}>
                    <Grid item xs={5}>
                        <Stack spacing={2}>
                            <Typography variant={'h2'}>
                                <span
                                    style={{
                                        color: 'white',
                                        fontFamily: 'Fira Code'
                                    }}
                                >
                                    <span style={{ color: 'gray' }}>@</span>
                                    compute
                                    <span
                                        style={{
                                            fontFamily: 'Lobster',
                                            fontSize: '110%'
                                        }}
                                    >
                                        <span style={{ color: 'gray' }}>.</span>
                                        toys
                                    </span>
                                </span>
                            </Typography>
                            <Typography variant={'h5'}>
                                <Link href="/new">New Shader</Link>
                            </Typography>
                            <Typography variant={'h5'}>
                                <Link href="/list/0">Browse</Link>
                            </Typography>

                            <Stack direction="row" spacing={2} justifyContent={'center'}>
                                <Image
                                    alt="Join us on Discord"
                                    width="35"
                                    height="27"
                                    src="/discord-white.png"
                                />
                                <Typography variant={'h5'}>
                                    <Link href="https://discord.gg/pNzH6gFQ2T">
                                        Join us on Discord
                                    </Link>
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} justifyContent={'center'}>
                                <Image
                                    alt="Code on GitHub"
                                    width="28"
                                    height="27"
                                    src="/github-mark-white.png"
                                />
                                <Typography variant={'h5'}>
                                    <Link href="https://github.com/compute-toys">
                                        Code on GitHub
                                    </Link>
                                </Typography>
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item xs={7}>
                        <Stack sx={{ textAlign: '-webkit-center' }}>
                            <Typography>Recent submissions</Typography>
                            <Box>
                                <NewSubmissionBar shaders={props.shaders} />
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Item>
        </Fragment>
    );
}

export async function getServerSideProps(context) {
    context.res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=120');

    if (supabase === null) {
        return {
            props: {
                shaders: [],
                error: 'Supabase client not initialized'
            }
        };
    }

    const { data, error } = await supabase
        .from('shader')
        .select(
            `
            id,
            name,
            profile:author (
                username,
                avatar_url
            ),
            thumb_url
        `
        )
        .order('created_at', { ascending: false })
        .range(0, 3)
        .eq('visibility', 'public');

    return {
        props: {
            shaders: data,
            error: error
        }
    };
}
