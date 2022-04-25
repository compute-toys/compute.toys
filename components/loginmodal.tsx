import {useEffect, useReducer, useState} from "react";
import {Button, Modal, Stack} from "@mui/material";
import Box from "@mui/material/Box";
import { Item } from "../theme/theme";
import Auth from "./auth";
import {useAuth, VIEWS} from "../lib/authcontext";
import Avatar from "./avatar";

export default function LoginModal() {
    const {user, view, session, logOut, username, avatar} = useAuth();
    const [open, setOpen] = useState(false);
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleLogOut = () => {
        logOut();
        setOpen(false);
    }

    useEffect(() => {
        forceUpdate();
    }, [view, username, avatar]);

    const logInOutButton = view === VIEWS.LOGGED_OUT ?
        <Button onClick={handleOpen}>Log In</Button> :
        <Button onClick={handleLogOut}>Log Out</Button>;
    return (
        <div>
            <Stack direction="row" alignItems="center" justifyContent="right" spacing={1}>
                <Avatar url={avatar} size={24} displayOnNull={false}/>
                <span>{username}</span>
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