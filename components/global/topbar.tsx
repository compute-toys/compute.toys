'use client';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { logout } from 'app/login/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import Logo from './logo';

export default function TopBar(props) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = e => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search/${searchQuery}/1`);
        }
    };

    return (
        <div>
            <Grid style={{ padding: '0.33rem' }} container>
                <Grid item xs={6}>
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
                <Grid item xs={2}>
                    <form onSubmit={handleSearch}>
                        <Stack direction="row" alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                sx={{
                                    backgroundColor: 'background.paper'
                                }}
                            />
                            <IconButton
                                type="submit"
                                sx={{
                                    color: 'primary.main'
                                }}
                            >
                                <SearchIcon />
                            </IconButton>
                        </Stack>
                    </form>
                </Grid>
                <Grid item xs={4}>
                    <Stack direction="row" alignItems="center" justifyContent="right" spacing={1}>
                        {props.user ? (
                            <>
                                {/* <Avatar url={profile.avatar ?? null} size={24} displayOnNull={false} /> */}
                                <Box height="100%" zIndex="10">
                                    <Link href={`/userid/${props.user.id}`}>
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
