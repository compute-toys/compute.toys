'use client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { logout } from 'app/login/actions';
import Link from 'next/link';
import { Fragment } from 'react';
import Logo from './logo';

export default function TopBar(props) {
    return (
        <div>
            <Grid style={{ padding: '0.33rem' }} container>
                <Grid item xs={8}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        height="100%"
                        marginLeft="1em"
                        spacing={0}
                    >
                        <Typography variant="h6">
                            <Link href="/">
                                <Logo />
                            </Link>
                        </Typography>
                        <Stack
                            direction="row"
                            marginLeft="2em"
                            paddingTop="0.2em"
                            zIndex="10"
                            spacing={2}
                        >
                            <Link href="/new">new</Link>
                            <Link href="/list/1">browse</Link>
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={4}>
                    <Stack direction="row" alignItems="center" justifyContent="right" spacing={1}>
                        {props.user ? (
                            <>
                                {/* <Avatar url={profile.avatar ?? null} size={24} displayOnNull={false} /> */}
                                <Box height="100%" zIndex="10">
                                    <Link href={`/profile/${props.user.user_metadata.username}`}>
                                        {props.user.email}
                                    </Link>
                                </Box>
                                <span>
                                    <form>
                                        <Button formAction={logout} type="submit">
                                            Logout
                                        </Button>
                                    </form>
                                </span>
                            </>
                        ) : (
                            <span>
                                <Fragment>
                                    <Button>
                                        <Link href={'/login'}>login or sign up</Link>
                                    </Button>
                                </Fragment>
                            </span>
                        )}
                    </Stack>
                </Grid>
            </Grid>
        </div>
    );
}
