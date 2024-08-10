'use client';
import AddIcon from '@mui/icons-material/Add';
import DisabledByDefaultSharp from '@mui/icons-material/DisabledByDefaultSharp';
import Button from '@mui/material/Button';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Typography from '@mui/material/Typography';
import { useAtomValue, useSetAtom } from 'jotai';
import { customTexturesAtom, loadedTexturesAtom, Texture } from 'lib/atoms/atoms';
import Image from 'next/image';
import { Fragment, MouseEventHandler, useRef, useState } from 'react';
import Draggable from 'react-draggable';

import { Item, theme } from 'theme/theme';
import { defaultTextures } from '../../lib/util/textureutils';
import AddTextureModal from '../global/pickfilemodal';

const TextureThumbsList = ({
    channel,
    textures,
    showAddButton,
    onAddButtonClick
}: {
    channel: number;
    textures: Texture[];
    showAddButton?: boolean;
    onAddButtonClick?: MouseEventHandler;
}) => {
    const setLoadedTextures = useSetAtom(loadedTexturesAtom);
    const size = 128;

    return (
        <ImageList sx={{ overflow: 'hidden' }} cols={6} rowHeight={size}>
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

const DraggablePicker = props => {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const customTextures = useAtomValue(customTexturesAtom);

    // Draggable needs this so React doesn't complain
    // about violating strict mode DOM access rules
    const nodeRef = useRef(null);

    return (
        <Fragment>
            <Draggable
                handle=".picker-handle"
                nodeRef={nodeRef}
                bounds="body"
                positionOffset={{ x: '0', y: '0' }}
            >
                <Item
                    ref={nodeRef}
                    elevation={12}
                    sx={
                        props.hidden
                            ? { display: 'none' }
                            : {
                                  zIndex: '2',
                                  display: 'inline-block',
                                  position: 'fixed',
                                  left: '12%',
                                  top: '12%'
                              }
                    }
                >
                    <div
                        className="picker-handle"
                        style={{
                            display: 'flex',
                            justifyContent: 'end',
                            backgroundImage:
                                'repeating-linear-gradient(-45deg, rgba(255,255,255, 0.25), rgba(255,255,255, 0.25) 2px, transparent 1px, transparent 6px)',
                            backgroundSize: '4px 4px'
                        }}
                    >
                        {/* Annoying viewbox tweak to align with drag bar*/}
                        <DisabledByDefaultSharp
                            viewBox="1.5 1.5 19.5 19.5"
                            onClick={() => props.setPickerHidden(true)}
                            color={'primary'}
                        />
                    </div>
                    <TextureThumbsList
                        channel={props.channel}
                        textures={defaultTextures}
                    ></TextureThumbsList>
                    <Typography sx={{ color: theme.palette.dracula.orange }}>
                        Custom textures
                    </Typography>
                    <TextureThumbsList
                        channel={props.channel}
                        textures={customTextures}
                        showAddButton
                        onAddButtonClick={() => setUploadModalOpen(true)}
                    ></TextureThumbsList>
                </Item>
            </Draggable>
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
