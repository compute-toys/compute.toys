import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import {Item, theme} from '../theme/theme';
import Draggable from 'react-draggable';
import {Fragment, useRef, useState} from "react";
import CancelIcon from '@mui/icons-material/Cancel';
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import {Button} from "@mui/material";
import {DisabledByDefaultSharp} from "@mui/icons-material";

export interface LoadedTextures {
    [key: number]: string
}

const DraggablePicker = (props) => {
    let size = 128;

    // Draggable needs this so React doesn't complain
    // about violating strict mode DOM access rules
    const nodeRef = useRef(null);

    return (
        <Draggable nodeRef={nodeRef} bounds="body" positionOffset={{x:'0',y:'0'}}>
            <Item ref={nodeRef} sx={props.hidden ? {display: 'none'} : {
                display: 'inline-block',
                position: 'fixed',
                left: '12%',
                top: '12%'}}
            >
                <div style={{display: 'flex', justifyContent: 'end',
                    backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255, 0.25), rgba(255,255,255, 0.25) 2px, transparent 1px, transparent 6px)',
                    backgroundSize: '4px 4px'
                }}>
                    {/* Annoying viewbox tweak to align with drag bar*/}
                    <DisabledByDefaultSharp viewBox="1.5 1.5 19.5 19.5" onClick={() => props.setPickerHidden(true)} color={'primary'}/>
                </div>
                <ImageList sx={{ width: size*6, height: size*4, overflow: 'hidden' }}
                           cols={6} rowHeight={size}
                >
                    { defaultTextures.map((item, index) => (
                        <ImageListItem key={item.img + props.channel}
                            onClick={() => {
                                props.setLoadedTextures(
                                    prevLoadedTextures => {
                                        const newArr = [...prevLoadedTextures]; //shallow copy is fine for now
                                        newArr[props.channel] = item.img;
                                        return newArr; //returning a modified prevLoadedTextures will cause downstream effect checks to fail!
                                    })
                            }}>
                            <img
                                style={{borderRadius: '4px'}}
                                src={`${item.img}?w=${size}&h=${size}&fit=crop&auto=format`}
                                srcSet={`${item.img}?w=${size}&h=${size}&fit=crop&auto=format&dpr=2 2x`}
                                loading="lazy"
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Item>
        </Draggable>
    );
}

export default function TexturePicker(props) {
    const [pickerHidden, setPickerHidden] = useState(true);
    const [pickerChannel, setPickerChannel] = useState(0);

    let size = 128;

    return (
        <Fragment>
            <Item sx={{display: "inline-block", marginTop: "18px"}}>
                <ImageList sx={{width: size * 2, height: size, marginTop: "0px", marginBottom: "0px"}}
                           cols={2} rowHeight={size}
                >
                    { props.loadedTextures.map((img, index) => (
                        <ImageListItem
                            key={img + index}
                            onClick={() => {
                                setPickerChannel(index);
                                setPickerHidden(!pickerHidden)
                            }}
                        >
                            <img
                                style={{borderRadius: '4px'}}
                                src={`${img}?w=${size}&h=${size}&fit=crop&auto=format`}
                                srcSet={`${img}?w=${size}&h=${size}&fit=crop&auto=format&dpr=2 2x`}
                                alt={img}
                                loading="lazy"
                            />
                            <ImageListItemBar
                                subtitle={"channel" + index}
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Item>
            <DraggablePicker hidden={pickerHidden} setPickerHidden={setPickerHidden} channel={pickerChannel} setLoadedTextures={props.setLoadedTextures}/>
        </Fragment>
    );
}

const defaultTextures = [
    {img: '/textures/blank.png'},
    {img: '/textures/london.jpg'},
    {img: '/textures/tex0.jpg'},
    {img: '/textures/tex1.jpg'},
    {img: '/textures/tex2.jpg'},
    {img: '/textures/tex3.jpg'},
    {img: '/textures/tex4.jpg'},
    {img: '/textures/tex5.jpg'},
    {img: '/textures/tex6.jpg'},
    {img: '/textures/tex7.jpg'},
    {img: '/textures/tex8.jpg'},
    {img: '/textures/tex9.jpg'},
    {img: '/textures/tex10.jpg'},
    {img: '/textures/tex11.jpg'},
    {img: '/textures/anim0.png'},
    {img: '/textures/bayer0.png'},
    {img: '/textures/font0.png'},
    {img: '/textures/height0.png'},
    {img: '/textures/noise0.png'},
    {img: '/textures/noise1.png'},
    {img: '/textures/noise2.png'},
    {img: '/textures/noise3.png'},
    {img: '/textures/noise4.png'}
];