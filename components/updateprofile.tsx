import {ChangeEvent, Fragment, useEffect, useState} from "react";
import {supabase} from "../lib/supabaseclient";
import {useAuth} from "../lib/authcontext";
import {Button, Modal, Stack, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Avatar from "./avatar";
import UploadButton from "./uploadbutton";
import {CssTextField, Item, theme} from "../theme/theme";
import {VIEWS} from "../lib/loginatoms";

export const UpdateProfile = () => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [username, setUsername] = useState(null);
    const [user, view, session, logOut, profile] = useAuth();
    const [openProfileModal, setOpenProfileModal] = useState(false);

    const [usernameEditor, setUsernameEditor] = useState(null);

    const [errorMessage, setErrorMessage] = useState(null);


    const checkUsername = async () => {
        try {
            let { data, error, status } = await supabase
                .from('profile')
                .select(`username`)
                .eq('id', user.id)
                .single();
            if (error && status !== 406) {
                setErrorMessage(error.message);
                throw error;
            }
            if (data) {
                setUsername(data.username);
                setAvatar(data.avatar_url);
                return data.username;
            } else {
                setUsername(null);
                setAvatar(null);
                return null;
            }
        } catch (error) {
            setUsername(null);
            setAvatar(null);
            return null;
        }
    }

    //https://github.com/supabase/supabase/blob/master/examples/nextjs-ts-user-management/components/Account.tsx
    const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length == 0) {
                setErrorMessage('You must select an image to upload.');
                throw 'No file selected';
            }

            const file = event.target.files[0]

            if (file.size > (50 * 1024)) {
                setErrorMessage('Please select an image that is less than 50KB');
                throw 'File must be less than 50KB';
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/avatar.${fileExt}`
            const filePath = `${fileName}`

            let { error: uploadError } = await supabase.storage
                .from('avatar')
                .upload(filePath, file, {upsert: true})

            if (uploadError) {
                setErrorMessage('Error uploading image: ' + uploadError.message);
                throw uploadError
            }

            let { error: updateError } = await supabase.from('profile').upsert({
                id: user!.id,
                avatar_url: filePath,
            })

            if (updateError) {
                setErrorMessage('Error updating profile image after upload: ' + updateError.message);
                throw updateError
            }

            setAvatar(filePath);
            setErrorMessage(null);
        } catch (error) {
            setAvatar(null)
        } finally {
            setUploading(false)
        }
    }

    async function updateProfile() {
        try {
            setLoading(true)

            const updates = {
                id: user!.id,
                username: usernameEditor
            }

            let { error } = await supabase.from('profile').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            })

            if (error) {
                setErrorMessage('Error updating username: ' + error.message);
                throw error
            }

            setUsername(usernameEditor);
            setErrorMessage(null);
        } catch (error) {
            setUsername(null);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (view === VIEWS.LOGGED_IN && !profile.username) {
            checkUsername().then((username) => {
                if (username === null) {
                    setOpenProfileModal(true);
                }
            });
        } else if (view === VIEWS.LOGGED_IN) {
            if (profile.username) {
                setUsername(profile.username);
            }
            if (profile.avatar) {
                setAvatar(profile.avatar);
            }
        }
    }, [view, profile.username, profile.avatar])

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

    const handleClose = () => setOpenProfileModal(false);

    return (
        <Modal
            open={openProfileModal}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Stack spacing={1}>
                    <Item sx={{color: theme.palette.dracula.orange}}>
                        <Typography>
                        {"This looks like the first time you've logged in"}
                        </Typography>
                    </Item>
                    <Item sx={{color: theme.palette.dracula.cyan}}>
                        <Stack>
                            <Typography>
                                Pick a username (required)
                            </Typography>
                            <Stack direction="row" justifyContent={"center"} sx={{marginTop: "10px"}}>
                                <CssTextField
                                    size={"small"}
                                    value={usernameEditor || ""}
                                    onChange={(e) => setUsernameEditor(e.target.value)}
                                />
                                <Button onClick={() => updateProfile()} sx={{color: theme.palette.dracula.cyan}}>
                                    Update
                                </Button>
                            </Stack>
                        </Stack>
                    </Item>
                    <Item sx={{color: theme.palette.dracula.green}}>
                        <Stack>
                            <Typography>
                            Upload a profile picture
                            </Typography>
                            <Stack direction="row" justifyContent={"center"} spacing={20} sx={{marginTop: "10px"}}>
                                <Avatar url={avatar} size={35} displayOnNull={true}/>
                                <UploadButton onUpload={uploadAvatar} loading={uploading} color={theme.palette.dracula.green}/>
                            </Stack>
                        </Stack>
                    </Item>
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
                    {username ?
                        <Item sx={{color: theme.palette.dracula.purple}}>
                            <Stack>
                                <Typography>
                                    All done?
                                </Typography>
                                <Button onClick={() => handleClose()} sx={{color: theme.palette.dracula.purple}}>
                                    Finish
                                </Button>
                            </Stack>
                        </Item>
                        : null
                    }
                </Stack>
            </Box>
        </Modal>
    );
}