import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAtom, useSetAtom } from 'jotai';
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from 'react';

import { customTexturesAtom, loadedTexturesAtom } from '../../lib/atoms/atoms';
import { getTextureFromProvidedUrl } from '../../lib/util/textureutils';
import { CssTextField, Item, theme } from '../../theme/theme';
import AllowedTextureSources from './allowedtexturesources';

export default function PickFileModal({
    open,
    setOpen,
    channelIdx
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    channelIdx: number;
}) {
    const [validating, setValidating] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [url, setUrl] = useState('');

    const [customTextures, setCustomTextures] = useAtom(customTexturesAtom);
    const setLoadedTextures = useSetAtom(loadedTexturesAtom);
    const handleClose = () => setOpen(false);

    const formSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setSubmitError('');
        setValidating(true);

        getTextureFromProvidedUrl(url)
            .then(texture => {
                // check after doing validation to check against normalized URLs
                const alreadyExists = customTextures.find(ex => ex.img === texture.img);

                if (alreadyExists) {
                    setSubmitError('Texture is already present in custom textures list');
                    return;
                }

                setLoadedTextures(prevLoadedTextures => {
                    const newArr = [...prevLoadedTextures]; //shallow copy is fine for now
                    newArr[channelIdx] = texture;
                    return newArr; //returning a modified prevLoadedTextures will cause downstream effect checks to fail!
                });

                setCustomTextures(existingTextures => {
                    return [...existingTextures, texture];
                });

                setSubmitError('');
                setUrl('');
                setOpen(false);
            })
            .catch(e => {
                setSubmitError(e.toString());
            })
            .finally(() => {
                setValidating(false);
            });
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-texture-add-title"
            aria-describedby="modal-texture-add-description"
        >
            <Item
                sx={{
                    display: 'block',
                    transform: 'translate(calc(50vw - 50%), calc(50vh - 50%))',
                    padding: '2.0rem',
                    maxWidth: 500
                }}
            >
                <Box autoComplete="off" component="form" onSubmit={formSubmit}>
                    <Stack spacing={2} alignItems="center">
                        <Typography
                            id="modal-texture-add-description"
                            component="h2"
                            sx={{ color: theme.palette.dracula.foreground }}
                        >
                            Supply a URL to an image that you would like to use as a texture
                        </Typography>
                        <CssTextField
                            // id="email-login-input"
                            fullWidth
                            error={Boolean(submitError)}
                            helperText={submitError}
                            aria-label={'Remote texture URL'}
                            size="medium"
                            label={'URL'}
                            type={'text'}
                            value={url || ''}
                            disabled={validating}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                setUrl(event.target.value);
                            }}
                            sx={{
                                input: { color: theme.palette.dracula.cyan },
                                label: { color: theme.palette.dracula.cyan }
                            }}
                        />
                        <AllowedTextureSources></AllowedTextureSources>
                        <Button
                            sx={
                                validating
                                    ? { color: theme.palette.dracula.green }
                                    : { color: theme.palette.dracula.green }
                            }
                            size="large"
                            variant="outlined"
                            type="submit"
                            disabled={validating}
                        >
                            <br />
                            <span>{validating ? 'Loading' : 'Add Texture'}</span>
                        </Button>
                    </Stack>
                </Box>
            </Item>
        </Modal>
    );
}
