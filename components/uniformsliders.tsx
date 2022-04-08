import {Dispatch, FunctionComponent, SetStateAction, useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {Button, Slider, Stack, TextField, Typography} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";
import React from "react";
import {styled} from "@mui/system";
import {theme} from "../theme/theme";
import { v4 as UUID } from 'uuid';

export class UniformSliderData {
    private readonly value: number;
    private readonly uniform: string;
    private readonly uuid: string;
    constructor(initialValue: number, uniform: string);
    constructor(value: number, uniform: string, from: UniformSliderData);
    constructor(...args: any[]) {
        if (args.length == 2) {
            this.value = args[0];
            this.uniform = args[1];
            this.uuid = UUID();
        } else if (args.length == 3) {
            this.value = args[0];
            this.uniform = args[1];
            this.uuid = args[2].getUUID();
        }
    }
    getValue() {
        return this.value;
    }
    getUniform() {
        return this.uniform;
    }
    getUUID() {
        return this.uuid;
    }
}

interface UniformSliderProps {
    slider: UniformSliderData
    index: number
    sliderArray: Array<UniformSliderData>
    setSliderArray: Dispatch<SetStateAction<Array<UniformSliderData>>>
}

const UniformSlider: FunctionComponent<UniformSliderProps> = (props, ref) => {

    const CssTextField = styled(TextField)({
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: theme.palette.dracula.currentLine,
            },
            '&:hover fieldset': {
                borderColor: theme.palette.dracula.currentLine,
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.dracula.foreground,
            },
            '&.Mui-focused input': {
                color: theme.palette.dracula.foreground,
            },
        },
    });

    return (
        <Box
            sx={{
                display: 'inline-grid', // grid/inline-grid yields incorrect vertical alignment
                gridAutoColumns: '1fr',
                gap: 1,
                width: '100%',
                paddingLeft: '2.5em'
            }}
        >
            <CssTextField
                id="outlined-name"
                key={props.slider.getUUID()}
                aria-label={"Uniform name input"}
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 2',
                    verticalAlign: 'middle',
                    input: {color: theme.palette.dracula.selection},
                    label: {color: theme.palette.dracula.selection}
                }}
                size="small"
                label="Name"
                value={props.slider.getUniform()}
                onChange={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    props.setSliderArray( oldSliderArray => {
                            return oldSliderArray.map(val => {
                                return (val.getUUID() == props.slider.getUUID()) ? new UniformSliderData(props.slider.getValue(), event.target.value, val) : val;
                            })
                        }
                    )
                }}
            />
            <Slider
                aria-label={props.slider.getUniform() + " slider"}
                sx={{ display: 'table-cell', gridRow: '1', gridColumn: 'span 7', verticalAlign: 'middle' }}
                value={props.slider.getValue()}
                onChange={
                    (event: Event, newValue: number | number[]) => {
                        props.setSliderArray( oldSliderArray => {
                                return oldSliderArray.map(val => {
                                    return (val.getUUID() == props.slider.getUUID()) ? new UniformSliderData(newValue as number, props.slider.getUniform(), val) : val;
                                })
                            }

                        )
                    }
                }
            />
            <Button
                aria-label={"Delete " + props.slider.getUniform() + " slider"}
                sx={{ display: 'table-cell', gridRow: '1', gridColumn: 'span 1', color: theme.status.danger, verticalAlign: 'middle' }}
                onClick={() => {
                    props.setSliderArray(
                        oldSliderArray => oldSliderArray
                            .filter((oldSlider) => { return oldSlider.getUniform() != props.slider.getUniform() })
                    );
                }}>
                <ClearIcon/>
            </Button>
        </Box>
    );
}


export const UniformSliders = (props) => {
    const theme = useTheme();

    const [sliderArray, setSliderArray] = useState<Array<UniformSliderData>>([]);

    return (
        <Box>
        <Stack spacing={2} direction="column" sx={{ mb: 1 }} alignItems="center">
            {sliderArray.map(
                    (slider, index) =>
                        <UniformSlider key={slider.getUUID()} slider={slider} index={index} sliderArray={sliderArray} setSliderArray={setSliderArray}/>
            )}
        </Stack>
        <Button sx={{color: theme.palette.primary.dark}}
                onClick={() => {
                    setSliderArray(oldSliderArray => [...oldSliderArray, new UniformSliderData(0, "Uniform " + sliderArray.length)])
                }}>
            <AddIcon/>
        </Button>
        </Box>
    );
}

export default UniformSliders;
