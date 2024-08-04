'use client';
import DisabledByDefaultSharp from '@mui/icons-material/DisabledByDefaultSharp';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import { useAtomValue, useSetAtom } from 'jotai';
import { loadedTexturesAtom, Texture } from 'lib/atoms/atoms';
import Image from 'next/image';
import { Fragment, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Item } from 'theme/theme';

const DraggablePicker = props => {
    const setLoadedTextures = useSetAtom(loadedTexturesAtom);

    const size = 128;

    // Draggable needs this so React doesn't complain
    // about violating strict mode DOM access rules
    const nodeRef = useRef(null);

    return (
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
                <ImageList sx={{ overflow: 'hidden' }} cols={6} rowHeight={size}>
                    {defaultTextures.map(item => (
                        <ImageListItem
                            key={item.img + props.channel}
                            onClick={() => {
                                setLoadedTextures(prevLoadedTextures => {
                                    const newArr = [...prevLoadedTextures]; //shallow copy is fine for now
                                    newArr[props.channel] = item;
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
                </ImageList>
            </Item>
        </Draggable>
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

function polyhaven_texture(name, map = 'diff') {
    return {
        img: `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/${name}/${name}_${map}_1k.jpg`,
        url: `https://polyhaven.com/a/${name}`
    };
}

function polyhaven_hdri(name) {
    return {
        img: `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/${name}_2k.hdr`,
        thumb: `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${name}.jpg`,
        url: `https://polyhaven.com/a/${name}`
    };
}

const defaultTextures: Texture[] = [
    polyhaven_texture('stone_brick_wall_001'),
    polyhaven_texture('wood_table_001'),
    polyhaven_texture('rusty_metal_02'),
    polyhaven_texture('rock_pitted_mossy'),
    polyhaven_texture('aerial_rocks_02'),
    polyhaven_texture('book_pattern', 'col2'),
    polyhaven_hdri('autumn_crossing'),
    polyhaven_hdri('dikhololo_night'),
    polyhaven_hdri('leadenhall_market'),
    polyhaven_hdri('music_hall_01'),
    polyhaven_hdri('spruit_sunrise'),
    polyhaven_hdri('vatican_road'),
    { img: '/textures/blank.png' },
    { img: '/textures/london.jpg' }, // https://commons.wikimedia.org/wiki/File:Regent_Street_Clay_Gregory.jpg
    { img: '/textures/anim0.png' },
    { img: '/textures/bayer0.png' },
    { img: '/textures/font0.png' }, // https://github.com/otaviogood/shader_fontgen
    polyhaven_texture('rocks_ground_01', 'disp'),
    { img: '/textures/noise0.png' },
    { img: '/textures/noise1.png' },
    { img: '/textures/noise2.png' },
    { img: '/textures/noise3.png' },
    { img: '/textures/noise4.png' }
];
