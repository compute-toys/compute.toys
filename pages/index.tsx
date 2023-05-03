import Head from 'next/head'
import Link from 'next/link'

import {Item, theme, getRainbowColor} from "theme/theme";

import 'firacode'
import '@fontsource/lobster'
import {ImageListItemBar, Stack, Typography, Alert, Modal} from "@mui/material";
import {supabase, SUPABASE_SHADERTHUMB_BUCKET_NAME} from "lib/db/supabaseclient";
import {SHADER_THUMB_SIZE_H, SHADER_THUMB_SIZE_V} from "./list/[page]";
import ImageListItem from "@mui/material/ImageListItem";
import Image from "next/image";
import {getFullyQualifiedSupabaseBucketURL} from "lib/util/urlutils";
import Box from "@mui/material/Box";
import Avatar from "components/global/avatar";
import ImageList from "@mui/material/ImageList";
import Grid from "@mui/material/Grid";
import {forwardRef, Fragment, useState} from "react";
import FakeLink from "components/global/fakelink";
import Logo from 'components/global/logo';



const NewSubmissionBar = (props) => {
    return (
        <ImageList gap={10} sx={{ width: SHADER_THUMB_SIZE_H*2.1 }}
                   cols={2} rowHeight={SHADER_THUMB_SIZE_V}
        >
            { props.shaders.map((shader, index) => (
                <ImageListItem key={shader.id}>
                    <Image
                        style={{borderRadius: '4px'}}
                        src={getFullyQualifiedSupabaseBucketURL(SUPABASE_SHADERTHUMB_BUCKET_NAME, shader.thumb_url)}
                        alt={shader.name}
                        width={SHADER_THUMB_SIZE_H}
                        height={SHADER_THUMB_SIZE_V}
                        loading="lazy"
                    />
                    <ImageListItemBar
                        title={<Link href={`/editor/${shader.id}`}>{shader.name}</Link>}
                        subtitle={`by ${shader.profile.username}`}
                        style={{borderRadius: '4px'}}
                        actionIcon={
                            <FakeLink href={`/profile/${shader.profile.username}`}>
                                <Box sx={{margin: "10px"}}>
                                    <Avatar url={shader.profile.avatar_url} size={25}/>
                                </Box>
                            </FakeLink>
                        }
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const style = {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '16px',
    width: "1050px",
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    color: theme.palette.dracula.foreground,
};

const ExplainerModal = forwardRef((props, ref) => {
    return (
        <Box sx={modalStyle}>
            <Stack spacing={2}>
                <Typography color={getRainbowColor(6)}>{"Download, install, and open "}<a href={"https://www.google.com/chrome/dev/"}>Chrome Dev</a></Typography>
                <Typography color={getRainbowColor(0)}>{`Enter about:flags into your search bar`}</Typography>
                <Box><Image alt="Chrome search bar" width="281" height="77" src={"/instructions/chromebar.png"}/></Box>
                <Typography color={getRainbowColor(1)}>{`In the "Search flags" bar, enter "webgpu"`}</Typography>
                <Box><Image alt="Search flags bar" width="450" height="58" src={"/instructions/webgpu.png"}/></Box>
                <Typography color={getRainbowColor(2)}>{`Enable "Unsafe WebGPU"`}</Typography>
                <Box><Image alt="Enable unsafe WebGPU" width="486" height="175" src={"/instructions/unsafe.png"}/></Box>
                <Typography color={getRainbowColor(3)}>{`You may need to restart your browser`}</Typography>
                <Typography color={getRainbowColor(4)}>{`You're done!`}</Typography>
            </Stack>
        </Box>
        );
});

ExplainerModal.displayName = "ExplainerModal";

export default function Home(props) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Fragment>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <ExplainerModal/>
            </Modal>
            <Alert variant={"outlined"} severity="warning" sx={{marginTop: "1em"}}>
                <Typography variant={"subtitle1"} color={theme.palette.neutral.contrastText}>
                    <Logo/> is an experimental editor for <a href="https://developer.chrome.com/articles/gpu-compute/">WebGPU compute shaders</a>.
                    At this time, only <a href={"https://www.google.com/chrome/"}>Chrome</a> (<a href="https://developer.chrome.com/blog/webgpu-release/">v113+</a>) is supported,
                    as <a href="https://caniuse.com/webgpu">WebGPU is not yet fully supported by other browsers</a>.
                </Typography>
            </Alert>
            <Item sx={style}>
                <Grid container spacing={2}>
                    <Grid item xs={5}>
                        <Stack spacing={2}>
                            <Typography variant={"h2"}>
                                <span style={{ color: 'white', fontFamily: 'Fira Code' }}>
                                    <span style={{ color: 'gray' }}>@</span>
                                    compute
                                    <span style={{ fontFamily: 'Lobster', fontSize: '110%' }}>
                                        <span style={{ color: 'gray' }}>.</span>
                                        toys
                                    </span>
                                </span>
                            </Typography>
                            <Typography variant={"h5"}>
                                <Link href="/new">New Shader</Link>
                            </Typography>
                            <Typography variant={"h5"}>
                                <Link href="/list/0">Browse</Link>
                            </Typography>
                            <FakeLink textDecoration="underline" href="https://discord.gg/pNzH6gFQ2T">
                                <Stack direction="row" spacing={2} justifyContent={"center"}>
                                    <Image alt="Join us on Discord" width="35" height="27" src="/discord-white.png"/>
                                    <Typography variant={"h5"}>
                                        Join us on Discord
                                    </Typography>
                                </Stack>
                            </FakeLink>
                        </Stack>
                    </Grid>
                    <Grid item xs={7}>
                        <Stack sx={{textAlign: "-webkit-center"}}>
                            <Typography>
                                Recent submissions
                            </Typography>
                            <Box>
                                <NewSubmissionBar shaders={props.shaders}/>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Item>
        </Fragment>
    )
}

export async function getServerSideProps(context) {
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=120, stale-while-revalidate=120'
    )

    const { data, count, error } = await supabase
        .from('shader')
        .select(`
            id,
            name,
            profile:author (
                username,
                avatar_url
            ),
            thumb_url
        `)
        .order("created_at", {ascending: false})
        .range(0, 3)
        .eq('visibility', 'public');

    return {
        props: {
            shaders: data,
            error: error
        },
    };
}
