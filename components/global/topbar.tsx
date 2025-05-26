'use client';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { logout } from 'app/login/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from './logo';

export default function TopBar(props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const router = useRouter();

    const handleSearch = e => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search/${searchQuery}/1`);
        }
    };

    const handleMenuOpen = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Grid style={{ padding: '0.33rem' }} container>
                <Grid item xs={6} sm="auto" sx={{ width: '200px' }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        height="100%"
                        width="100%"
                        marginLeft="1em"
                        marginRight="1.7em"
                    >
                        <Typography variant="h6">
                            <Link href="/">
                                <Logo />
                            </Link>
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={6} sm sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="left" justifyContent="right">
                        <Stack
                            direction="row"
                            sx={{
                                display: { xs: 'none', sm: 'flex' },
                                width: '100%',
                                alignItems: 'center'
                            }}
                        >
                            <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                                <Link href="/new">new</Link>
                                <Link href="/list/1">browse</Link>
                            </Stack>
                            <Stack direction="row" justifyContent="center" sx={{ flex: 1 }}>
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
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={3}
                                justifyContent="flex-end"
                                sx={{ flex: 1 }}
                            >
                                {props.user ? (
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Link
                                            href={`/userid/${props.user.id}`}
                                            className="flex items-center"
                                        >
                                            {props.user.email}
                                        </Link>
                                        <form>
                                            <Button formAction={logout} type="submit">
                                                Logout
                                            </Button>
                                        </form>
                                    </Stack>
                                ) : (
                                    <Button>
                                        <Link href={'/login'}>login or sign up</Link>
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ display: { sm: 'none' } }}
                            onClick={handleMenuOpen}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Stack>
                </Grid>
            </Grid>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem>
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
                </MenuItem>
                <MenuItem component={Link} href="/new" onClick={handleMenuClose}>
                    New
                </MenuItem>
                <MenuItem component={Link} href="/list/1" onClick={handleMenuClose}>
                    Browse
                </MenuItem>
                {props.user ? (
                    [
                        <MenuItem
                            component={Link}
                            href={`/userid/${props.user.id}`}
                            onClick={handleMenuClose}
                            key="user"
                        >
                            {props.user.email}
                        </MenuItem>,
                        <MenuItem onClick={handleMenuClose} key="logout">
                            <form>
                                <Button formAction={logout} type="submit">
                                    Logout
                                </Button>
                            </form>
                        </MenuItem>
                    ]
                ) : (
                    <MenuItem onClick={handleMenuClose}>
                        <Button>
                            <Link href={'/login'}>login or sign up</Link>
                        </Button>
                    </MenuItem>
                )}
            </Menu>
        </div>
    );
}
