import {ChangeEvent, forwardRef, Fragment, useEffect, useReducer, useState} from "react";
import {Button, Modal, Stack, Typography} from "@mui/material";
import {CssTextField, Item, theme} from "theme/theme";
import {AuthLogIn, useAuth, VIEWS} from "lib/authcontext";
import Avatar from "components/avatar";
import Link from 'next/link'

interface LoginWindowProps {
    logIn: AuthLogIn,
    close: () => void
}

export const LoginWindow = forwardRef((props: LoginWindowProps, ref) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [error, setError] = useState(null);


    const handleLogin = async (email) => {
        setLoading(true)
        const { error } = await props.logIn(email, password);
        if (error) {
            setError(error);
        } else {
            props.close();
        }
    }

    // modern CSS centering trick
    return (
            <Item sx={{display: "inline-block", transform: "translate(calc(50vw - 50%), calc(50vh - 50%))"}}>
                <Stack spacing={2}>
                    <Typography component="h2" sx={{color: theme.palette.dracula.foreground}}>
                        Enter email and password
                    </Typography>
                    <CssTextField
                        disabled={loading}
                        id="email-login-input"
                        aria-label={"Email input"}
                        size="small"
                        label={"Email"}
                        value={email || ""}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {setEmail(event.target.value)}}
                        sx ={{
                            input: {color: theme.palette.dracula.cyan},
                            label: {color: theme.palette.dracula.cyan}
                        }}
                    />
                    <CssTextField
                        disabled={loading}
                        id="password-login-input"
                        size={"small"}
                        aria-label={"Password input"}
                        label={"Password"}
                        value={password || ""}
                        onChange={(e) => setPassword(e.target.value)}
                        type={"password"}
                        sx ={{
                            input: {color: theme.palette.dracula.pink},
                            label: {color: theme.palette.dracula.pink}
                        }}
                    />
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            handleLogin(email)
                        }}
                        sx={loading ? {color: theme.status.disabled} : {color: theme.palette.dracula.orange}}
                        disabled={loading}
                    >
                        <span>{loading ? 'Loading' : 'Log In'}</span>
                    </Button>
                    {error ?
                        <Item sx={{color: theme.palette.dracula.red}}>
                            <Stack>
                                <Typography>
                                    {error?.message}
                                </Typography>
                            </Stack>
                        </Item>
                        : null
                    }
                </Stack>
            </Item>
    )
});

LoginWindow.displayName = "LoginWindow";

export default function LoginModal() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const {view, profile, logIn, logOut} = useAuth();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleLogOut = () => {
        logOut();
        setOpen(false);
    }

    useEffect(() => {
        forceUpdate();
    }, [view, profile.username, profile.avatar]);

    const logInOutButton = view === VIEWS.LOGGED_OUT ?
        <Fragment>
            <Button onClick={handleOpen}>
                Log In
            </Button>
            or
            <Button>
                <Link href={"/signup"}>Sign Up</Link>
            </Button>
        </Fragment> :
        <Button onClick={handleLogOut}>Log Out</Button>;

    return (
        <div>
            <Stack direction="row" alignItems="center" justifyContent="right" spacing={1}>
                <Avatar url={profile.avatar ?? null} size={24} displayOnNull={false}/>
                <span>{profile.username ?? null}</span>
                <span>{logInOutButton}</span>
            </Stack>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <LoginWindow logIn={logIn} close={handleClose}/>
            </Modal>
        </div>
    );
}