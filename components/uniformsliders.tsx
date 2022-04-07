import {Dispatch, FunctionComponent, SetStateAction, useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {Button, Slider, Stack, TextField, Typography} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";
import React from "react";
import {styled} from "@mui/system";
import {theme} from "../theme/theme";

export class UniformSliderData {
    private value: number;
    private uniform: string;
    constructor(initialValue: number, uniform: string) {
        this.value = initialValue;
        this.uniform = uniform;
    }
    getValue() {
        return this.value;
    }
    setValue(value: number) {
        this.value = value;
    }
    getUniform() {
        return this.uniform;
    }
    setUniform(uniform: string) {
        this.uniform = uniform;
    }
}


export const UniformSliders = (props) => {
    const theme = useTheme();

    const [sliderArray, setSliderArray] = useState<Array<UniformSliderData>>([]);

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

    const sliders = sliderArray.map((slider, index) =>
        <Box
            key={slider.getUniform()}
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
                value={slider.getUniform()}
                onChange={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    setSliderArray( oldSliderArray => {
                            return oldSliderArray.map(val => {
                                return (val.getUniform() == slider.getUniform()) ? new UniformSliderData(slider.getValue(), event.target.value) : val;
                            })
                        }
                    )
                }}
            />
            <Slider
                aria-label={slider.getUniform() + " slider"}
                sx={{ display: 'table-cell', gridRow: '1', gridColumn: 'span 7', verticalAlign: 'middle' }}
                value={slider.getValue()}
                onChange={
                    (event: Event, newValue: number | number[]) => {
                        setSliderArray( oldSliderArray => {
                                return oldSliderArray.map(val => {
                                    return (val.getUniform() == slider.getUniform()) ? new UniformSliderData(newValue as number, slider.getUniform()) : val;
                                })
                            }

                        )
                    }
                }
            />
            <Button
                aria-label={"Delete " + slider.getUniform() + " slider"}
                sx={{ display: 'table-cell', gridRow: '1', gridColumn: 'span 1', color: theme.status.danger, verticalAlign: 'middle' }}
                onClick={() => {
                    setSliderArray(
                        oldSliderArray => oldSliderArray
                            .filter((oldSlider) => { return oldSlider.getUniform() != slider.getUniform() })
                    );
                }}>
                <ClearIcon/>
            </Button>
        </Box>
    );

    return (
        <Box>
        <Stack spacing={2} direction="column" sx={{ mb: 1 }} alignItems="center">
            {sliders}
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
