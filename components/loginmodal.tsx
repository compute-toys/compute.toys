import {ChangeEvent, forwardRef, Fragment, useEffect, useReducer, useState} from "react";
import {Button, Modal, Stack, Typography} from "@mui/material";
import {CssTextField, Item, theme} from "theme/theme";
import {AuthConfirm, AuthLogIn, AuthResetPassword, AuthUpdatePassword, useAuth, VIEWS} from "lib/authcontext";
import Avatar from "components/avatar";
import Link from 'next/link'

interface LoginWindowProps {
    logIn: AuthLogIn,
    resetPassword: AuthResetPassword,
    confirm: AuthConfirm,
    updatePassword: AuthUpdatePassword,
    close: () => void
}

export const LoginWindow = forwardRef((props: LoginWindowProps, ref) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [error, setError] = useState(null);
    const [forgot, setForgot] = useState(false);
    const [awaitConfirm, setAwaitConfirm] = useState(false);
    const [awaitNewPassword, setAwaitNewPassword] = useState(false);
    const [token, setToken] = useState(null);


    const handleLogin = async () => {
        setLoading(true)
        const { error } = await props.logIn(email, password);
        if (error) {
            setLoading(false);
            setError(error);
        } else {
            setLoading(false);
            props.close();
        }
    }

    const handleForgot = () => {
        setForgot(true);
        setError(null);
    }

    const handleResetPassword = () => {
        setLoading(true)
        props.resetPassword(email)
            .then(({error}) => {
                if (error) {
                    setError(error);
                    setLoading(false);
                    setAwaitConfirm(false);
                } else {
                    setError(null);
                    setAwaitConfirm(true);
                    setLoading(false);
                }

            });
    }

    const handleConfirmOTP = () => {
        setLoading(true)
        props.confirm(email, token, "recovery")
            .then(({error}) => {
                if (error) {
                    setError(error);
                    setLoading(false);
                } else {
                    setError(null);
                    setAwaitConfirm(false);
                    setAwaitNewPassword(true);
                    setLoading(false);
                }
            });
    }

    const handleUpdatePassword = () => {
        setLoading(true)
        props.updatePassword(password)
            .then(({error}) => {
                if (error) {
                    setError(error);
                    setLoading(false);
                } else {
                    setError(null);
                    setAwaitConfirm(false);
                    setAwaitNewPassword(false);
                    setLoading(false);
                    props.close();
                }
            });
    }

    const onEnterKey = (event) => {
        if(event.keyCode == 13){ // enter
            handleLogin();
        }
    };

    const getPrompt = () => {
        if (forgot) {
            if (!awaitConfirm && !awaitNewPassword) {
                return 'Enter your email to receive a recovery code';
            } else if (awaitConfirm) {
                return 'Enter your confirmation code';
            } else if (awaitNewPassword) {
                return 'Enter your new password';
            }
        } else {
            return 'Enter email and password';
        }
    }

    const getContextDialog = () => {
        if (forgot) {
            if (!awaitConfirm && !awaitNewPassword) {
                return (
                    <Button
                        onClick={(e) => {
                            handleResetPassword()
                        }}
                        sx={loading ? {color: theme.status.disabled} : {color: theme.palette.dracula.orange}}
                        disabled={loading || awaitConfirm}
                    >
                        <span>{loading ? 'Loading' : 'Request Code'}</span>
                    </Button>
                );
            } else if (awaitConfirm) {
                return (
                    <Fragment>
                        <CssTextField
                            disabled={loading}
                            id="code-login-input"
                            size={"small"}
                            aria-label={"Code input"}
                            label={"Code"}
                            value={token || ""}
                            onChange={(e) => setToken(e.target.value)}
                            sx ={{
                                input: {color: theme.palette.dracula.pink},
                                label: {color: theme.palette.dracula.pink}
                            }}
                        />
                        <Button
                            onClick={(e) => {
                                handleConfirmOTP()
                            }}
                            sx={loading ? {color: theme.status.disabled} : {color: theme.palette.dracula.orange}}
                            disabled={loading}
                        >
                            <span>{loading ? 'Loading' : 'Submit Code'}</span>
                        </Button>
                    </Fragment>
                );
            } else if (awaitNewPassword) {
                return (
                    <Button
                        onClick={(e) => {
                            handleUpdatePassword()
                        }}
                        sx={loading ? {color: theme.status.disabled} : {color: theme.palette.dracula.orange}}
                        disabled={loading || awaitConfirm}
                    >
                        <span>{loading ? 'Loading' : 'Update Password'}</span>
                    </Button>
                );
            }
        } else {
            return (
                <Button
                    onClick={(e) => {
                        e.preventDefault()
                        handleLogin()
                    }}
                    sx={loading ? {color: theme.status.disabled} : {color: theme.palette.dracula.orange}}
                    disabled={loading}
                >
                    <span>{loading ? 'Loading' : 'Log In'}</span>
                </Button>
            );
        }
    }

    // modern CSS centering trick
    return (
            <Item sx={{display: "inline-block", transform: "translate(calc(50vw - 50%), calc(50vh - 50%))"}}>
                <Stack spacing={2}>
                    <Typography component="h2" sx={{color: theme.palette.dracula.foreground}}>
                        {getPrompt()}
                    </Typography>
                    <CssTextField
                        disabled={loading || awaitNewPassword || awaitConfirm}
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
                    { (forgot && !awaitNewPassword) ? null : <CssTextField
                        disabled={loading}
                        id="password-login-input"
                        size={"small"}
                        aria-label={"Password input"}
                        label={"Password"}
                        value={password || ""}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={onEnterKey}
                        type={"password"}
                        sx ={{
                            input: {color: theme.palette.dracula.pink},
                            label: {color: theme.palette.dracula.pink}
                        }}
                    /> }
                    { getContextDialog() }
                    { forgot ? null : <a onClick={(e) => handleForgot()}>Forgot your password?</a>}
                    {error ?
                        <Item sx={{color: theme.palette.dracula.red}}>
                            <Stack>
                                <Typography>
                                    {error?.message ?? error}
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
    const {view, profile, logIn, logOut, confirm, resetPassword, updatePassword} = useAuth();
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
                <span>{profile.username ? <Link href={`/profile/${profile.username}`}>{profile.username}</Link> : null}</span>
                <span>{logInOutButton}</span>
            </Stack>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <LoginWindow logIn={logIn} resetPassword={resetPassword} updatePassword={updatePassword} confirm={confirm} close={handleClose}/>
            </Modal>
        </div>
    );
}