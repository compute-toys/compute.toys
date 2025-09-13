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
import { logout } from 'lib/auth/actions';
// Removed Next.js imports, using native navigation
import { useState } from 'react';
import Logo from './logo';

interface TopBarProps {
    user?: any; // TODO: type this properly
}

export default function TopBar(props: TopBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            window.location.href = `/search/${encodedQuery}/1`;
        }
    };

    const handleMenuOpen = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const LogoutForm = () => (
        <form>
            <Button formAction={logout} type="submit">
                Logout
            </Button>
        </form>
    );

    const UserEmail = () => (
        <a href={`/userid/${props.user.id}`} className="flex items-center" style={{ textDecoration: 'none', color: 'inherit' }}>
            {props.user.email}
        </a>
    );

    const BurgerMenu = (
        <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ display: { sm: 'none' } }}
            onClick={handleMenuOpen}
        >
            <MenuIcon />
        </IconButton>
    );

    const LogoStack = (
        <Stack marginLeft="1em" marginRight="1.7em">
            <Typography variant="h6">
                <a href="/" style={{textDecoration: "none", color: "inherit"}}>
                    <Logo />
                </a>
            </Typography>
        </Stack>
    );

    const SearchForm = (
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
                    onClick={handleMenuClose}
                >
                    <SearchIcon />
                </IconButton>
            </Stack>
        </form>
    );

    return (
        <div>
            <Grid style={{ padding: '0.33rem' }} container>
                <Grid item xs={6} sm="auto" sx={{ width: '200px' }}>
                    {LogoStack}
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
                                <a href="/new" style={{textDecoration: "none", color: "inherit"}}>new</a>
                                <a href="/list/1" style={{textDecoration: "none", color: "inherit"}}>browse</a>
                            </Stack>
                            <Stack direction="row" justifyContent="center" sx={{ flex: 1 }}>
                                {SearchForm}
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={2}
                                justifyContent="flex-end"
                                sx={{ flex: 1 }}
                            >
                                {props.user ? (
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <UserEmail />
                                        <LogoutForm />
                                    </Stack>
                                ) : (
                                    <Button>
                                        <a href={'/login'} style={{textDecoration: "none", color: "inherit"}}>login / sign up</a>
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                        {BurgerMenu}
                    </Stack>
                </Grid>
            </Grid>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem>{SearchForm}</MenuItem>
                <MenuItem
                    component="a"
                    href="/new.html"
                    onClick={handleMenuClose}
                    sx={{ marginLeft: 1.3 }}
                >
                    New
                </MenuItem>
                <MenuItem
                    component="a"
                    href="/list.html?page=1"
                    onClick={handleMenuClose}
                    sx={{ marginLeft: 1.3 }}
                >
                    Browse
                </MenuItem>
                {props.user ? (
                    [
                        <MenuItem onClick={handleMenuClose} key="user" sx={{ marginLeft: 1.5 }}>
                            <UserEmail />
                        </MenuItem>,
                        <MenuItem onClick={handleMenuClose} key="logout">
                            <LogoutForm />
                        </MenuItem>
                    ]
                ) : (
                    <MenuItem
                        component="a"
                        href="/login.html"
                        onClick={handleMenuClose}
                        sx={{ marginLeft: 1.3 }}
                    >
                        LOGIN / SIGN UP
                    </MenuItem>
                )}
            </Menu>
        </div>
    );
}
