import {useEffect, useState} from "react";
import {useAuth, VIEWS} from "lib/authcontext";
import {Button, Modal, Stack, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import {CssTextField, Item, theme} from "theme/theme";

export const SignUp = () => {
    const {signUp} = useAuth();

    const [usernameEditor, setUsernameEditor] = useState(null);
    const [emailEditor, setEmailEditor] = useState(null);
    const [password1Editor, setPassword1Editor] = useState(null);
    const [password2Editor, setPassword2Editor] = useState(null);
    const [passwordValid, setPasswordValid] = useState(false);
    const [usernameValid, setUsernameValid] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [allValid, setAllValid] = useState(false);
    const [success, setSuccess] = useState(false);

    const [errorMessage, setErrorMessage] = useState(null);

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
    // emails are basically "unvalidatable," we use a simple one that catches almost all cases here
    const validateEmail = () => {
        if(/^\S+@\S+\.\S+$/.test(emailEditor)) {
            setEmailValid(true);
            setErrorMessage(null);
            return true;
        } else {
            setEmailValid(false);
            setErrorMessage("This doesn't look like a valid email");
            return false;
        }
    };

    const validateUsername = () => {
        if(/^[A-Za-z0-9]{6,24}$/.test(usernameEditor)) {
            setUsernameValid(true);
            setErrorMessage(null);
            return true;
        } else {
            setUsernameValid(false);
            setErrorMessage("Username must be alphanumeric, between 6 and 24 characters");
            return false;
        }
    }

    const validatePassword = () => {
        if (!password1Editor || !password2Editor || password1Editor !== password2Editor) {
            setPasswordValid(false);
            setErrorMessage("Passwords must match");
            return false;
        } else {
            const valid = password1Editor.length >= 8;
            if (valid) {
                setErrorMessage(null);
                setPasswordValid(true);
                return true;
            } else {
                setErrorMessage("Password must be at least 8 characters in length");
                setPasswordValid(false);
                return false;
            }
        }
    }

    useEffect(() => {
        if (emailValid && passwordValid && usernameValid) {
            setAllValid(true);
        } else {
            setAllValid(false);
        }
    }, [emailValid, usernameValid, passwordValid])

    const submit = async () => {
        const {error} = await signUp(emailEditor, usernameEditor, password1Editor);
        if (error) {
            setErrorMessage(error.message)
            setSuccess(false);
        } else {
            setSuccess(true);
        }
    }

    return (
            <Box sx={style}>
                <Stack spacing={1}>
                    <Item sx={{color: theme.palette.dracula.orange}}>
                        <Typography>
                            {"Sign up to save your shaders"}
                        </Typography>
                    </Item>
                    <Item sx={{color: theme.palette.dracula.purple}}>
                        <Stack>
                            <Typography>
                                Email address (required)
                            </Typography>
                            <Stack direction="row" justifyContent={"center"} sx={{marginTop: "10px"}}>
                                <CssTextField
                                    disabled={success}
                                    id="email-login-input"
                                    size={"small"}
                                    value={emailEditor || ""}
                                    onChange={(e) => {setEmailEditor(e.target.value)}}
                                    onBlur={(e) => {validateEmail()}}
                                />
                            </Stack>
                        </Stack>
                    </Item>
                    <Item sx={{color: theme.palette.dracula.cyan}}>
                        <Stack>
                            <Typography>
                                Username (required)
                            </Typography>
                            <Stack direction="row" justifyContent={"center"} sx={{marginTop: "10px"}}>
                                <CssTextField
                                    disabled={success}
                                    id="username-login-input"
                                    size={"small"}
                                    value={usernameEditor || ""}
                                    onChange={(e) => setUsernameEditor(e.target.value)}
                                    onBlur={(e) => {validateUsername()}}
                                />
                            </Stack>
                        </Stack>
                    </Item>
                    <Item sx={{color: theme.palette.dracula.pink}}>
                        <Stack>
                            <Typography>
                                Password (required)
                            </Typography>
                            <Stack direction="row" justifyContent={"center"} sx={{marginTop: "10px"}}>
                                <CssTextField
                                    disabled={success}
                                    id="password-login-input"
                                    size={"small"}
                                    value={password1Editor || ""}
                                    onChange={(e) => setPassword1Editor(e.target.value)}
                                    onBlur={(e) => {validatePassword()}}
                                    type={"password"}
                                />
                            </Stack>
                        </Stack>
                    </Item>
                    <Item sx={{color: theme.palette.dracula.pink}}>
                        <Stack>
                            <Typography>
                                Password again (required)
                            </Typography>
                            <Stack direction="row" justifyContent={"center"} sx={{marginTop: "10px"}}>
                                <CssTextField
                                    disabled={success}
                                    id="password-login-input"
                                    size={"small"}
                                    value={password2Editor || ""}
                                    onChange={(e) => setPassword2Editor(e.target.value)}
                                    onBlur={(e) => {validatePassword()}}
                                    type={"password"}
                                />
                            </Stack>
                        </Stack>
                    </Item>
                    {(allValid && !success) ?
                        <Item sx={{color: theme.palette.dracula.purple}}>
                            <Stack>
                                <Typography>
                                    All done?
                                </Typography>
                                <Button onClick={() => submit()} sx={{color: theme.palette.dracula.purple}}>
                                    Submit
                                </Button>
                            </Stack>
                        </Item>
                        : null
                    }
                    {errorMessage ?
                        <Item sx={{color: theme.palette.dracula.red}}>
                            <Stack>
                                <Typography>
                                    {errorMessage}
                                </Typography>
                            </Stack>
                        </Item>
                        : null
                    }
                    {success ?
                        <Item sx={{color: theme.palette.dracula.green}}>
                            <Stack>
                                <Typography>
                                    Check your email for a confirmation link!
                                </Typography>
                            </Stack>
                        </Item>
                        : null
                    }
                </Stack>
            </Box>
    );
}

export default SignUp;