'use client';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAtomValue, useSetAtom } from 'jotai';
import { customTexturesAtom, loadedTexturesAtom, Texture } from 'lib/atoms/atoms';
import Image from 'next/image';
import { Dispatch, Fragment, MouseEventHandler, SetStateAction, useState } from 'react';
import { Item, theme } from 'theme/theme';

import { defaultTextures } from '../../lib/util/textureutils';
import DraggableWindow from '../global/draggable-window';
import AddTextureModal from '../global/pickfilemodal';

const TextureThumbsList = ({
    cols,
    channel,
    textures,
    showAddButton,
    onAddButtonClick
}: {
    cols?: number;
    channel: number;
    textures: Texture[];
    showAddButton?: boolean;
    onAddButtonClick?: MouseEventHandler;
}) => {
    const setLoadedTextures = useSetAtom(loadedTexturesAtom);
    const size = 128;

    return (
        <ImageList sx={{ overflow: 'hidden' }} cols={cols} rowHeight={size}>
            {textures.map(item => (
                <ImageListItem
                    key={item.img + channel}
                    onClick={() => {
                        setLoadedTextures(prevLoadedTextures => {
                            const newArr = [...prevLoadedTextures]; //shallow copy is fine for now
                            newArr[channel] = item;
                            return newArr; //returning a modified prevLoadedTextures will cause downstream effect checks to fail!
                        });
                    }}
                >
                    <Image
                        style={{ borderRadius: '4px' }}
                        src={item.thumb || item.img}
                        alt={item.img}
                        width={size}
                        height={size}
                        loading="lazy"
                    />
                </ImageListItem>
            ))}
            {showAddButton && (
                <Button
                    variant="outlined"
                    style={{ width: size, height: size, display: 'flex' }}
                    onClick={onAddButtonClick}
                >
                    <AddIcon style={{ transform: 'scale(1.75)' }}></AddIcon>
                </Button>
            )}
        </ImageList>
    );
};

interface DraggablePickerProps {
    channel: number;
    setPickerHidden: Dispatch<SetStateAction<boolean>>;
    hidden: boolean;
}

const DraggablePicker = (props: DraggablePickerProps) => {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const customTextures = useAtomValue(customTexturesAtom);

    // media queries for texture picker size
    const mediumView = useMediaQuery(theme.breakpoints.up('md'));
    const largeView = useMediaQuery(theme.breakpoints.up('lg'));

    return (
        <Fragment>
            <DraggableWindow setHidden={props.setPickerHidden} hidden={props.hidden}>
                <div
                    style={{
                        // just a little bit less than the full screen height, 100px here is somewhat arbitrary
                        maxHeight: 'calc(100vh - 100px)',
                        overflowY: 'auto'
                    }}
                >
                    <TextureThumbsList
                        cols={largeView ? 8 : mediumView ? 6 : 3}
                        channel={props.channel}
                        textures={defaultTextures}
                    ></TextureThumbsList>
                    <Typography sx={{ color: theme.palette.dracula.orange }}>
                        Custom textures
                    </Typography>
                    <TextureThumbsList
                        cols={largeView ? 8 : mediumView ? 6 : 3}
                        channel={props.channel}
                        textures={customTextures}
                        showAddButton
                        onAddButtonClick={() => setUploadModalOpen(true)}
                    ></TextureThumbsList>
                </div>
            </DraggableWindow>
            <AddTextureModal
                open={uploadModalOpen}
                channelIdx={props.channel}
                setOpen={setUploadModalOpen}
            ></AddTextureModal>
        </Fragment>
    );
};

export default function TexturePicker() {
    const [pickerHidden, setPickerHidden] = useState(true);
    const [pickerChannel, setPickerChannel] = useState(0);

    const loadedTextures = useAtomValue(loadedTexturesAtom);

    const size = 128;

    return (
        <Fragment>
            <Item sx={{ display: 'inline-block', marginTop: '18px' }}>
                <ImageList
                    sx={{
                        width: size * 2,
                        height: size,
                        overflow: 'hidden',
                        marginTop: '0px',
                        marginBottom: '0px'
                    }}
                    cols={2}
                    rowHeight={size}
                >
                    {loadedTextures.map((item, index) => (
                        <ImageListItem
                            key={item.img + index}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setPickerChannel(index);
                                setPickerHidden(!pickerHidden);
                            }}
                        >
                            <Image
                                style={{ borderRadius: '4px' }}
                                src={item.thumb || item.img}
                                alt={'Channel ' + index + ' texture'}
                                width={size}
                                height={size}
                                priority={true}
                            />
                            <ImageListItemBar subtitle={'channel' + index} />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Item>
            <DraggablePicker
                hidden={pickerHidden}
                setPickerHidden={setPickerHidden}
                channel={pickerChannel}
            />
        </Fragment>
    );
}
