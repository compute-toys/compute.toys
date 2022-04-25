import {useEffect, useReducer, useState} from "react";
import {Button, Modal, Stack} from "@mui/material";
import Box from "@mui/material/Box";
import { Item } from "../theme/theme";
import Auth from "./auth";
import {useAuth} from "../lib/authcontext";
import Avatar from "./avatar";
import {VIEWS} from "../lib/loginatoms";

export default function LoginModal() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const [user, view, session, logOut, profile] = useAuth();
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
        <Button onClick={handleOpen}>Log In</Button> :
        <Button onClick={handleLogOut}>Log Out</Button>;

    console.log(user, view, profile.username, profile.avatar);

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
                <Item>
                    <Auth/>
                </Item>
            </Modal>
        </div>
    );
}