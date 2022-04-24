import {useState} from "react";
import {Button, Modal} from "@mui/material";
import Box from "@mui/material/Box";
import { Item } from "../theme/theme";
import Auth from "./auth";
import {useAuth, VIEWS} from "../lib/authcontext";

export default function LoginModal() {
    const {user, view, session, logOut} = useAuth();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleLogOut = () => {
        logOut();
        setOpen(false);
    }

    const logInOutButton = view === VIEWS.LOG_IN ?
        <Button onClick={handleOpen}>Log In</Button> :
        <Button onClick={handleLogOut}>Log Out</Button>;
    return (
        <div>
            {logInOutButton}
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