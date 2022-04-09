import {MutableRefObject, useReducer, useRef, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {Button, Slider, Stack, TextField} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";
import React from "react";
import {styled} from "@mui/system";
import {theme} from "../theme/theme";
import { v4 as UUID } from 'uuid';


export interface UniformSliderRef {
    getVal: () => number;
    getUniform: () => string;
    getUUID: () => string;
}

interface UniformSliderProps {
    setRefCallback: (r: React.MutableRefObject<UniformSliderRef>) => void
    deleteCallback: (uuid: string) => void
    uuid: string
}


// This MUST be declared outside component, or wrapped as a JSX.Element
// Otherwise rerender is triggered every time.
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

const validate = (text: string) => {
    let matched = text.match(/^[a-zA-Z][a-zA-Z0-9_]*$/);
    return (matched && matched.length === 1);
}

const CustomTextField = React.forwardRef((props: any, inputRef: MutableRefObject<any>) => {
    /*
        Avoid re-rendering the containing (parent) component
        by storing in-progress edits in local state
     */
    const [temporaryFieldValue, setTemporaryFieldValue] = useState("Uniform");
    const [err, setErr] = useState(false);

    React.useEffect(() => {
        setTemporaryFieldValue(props.sliderUniform);
    },[props.sliderUniform]);

    const onEnterKey = (event) => {
        if(event.keyCode == 13){ // enter
            inputRef.current.blur();
        }
    };

    return (<CssTextField
        error={err}
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
        inputRef={inputRef}
        size="small"
        label={err ? "Invalid" : "Name"}
        value={temporaryFieldValue}
        onKeyDown={onEnterKey}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {setTemporaryFieldValue(event.target.value)}}
        onBlur={ (event: React.FocusEvent<HTMLInputElement>) => {
            if (validate(event.target.value)) {
                props.setSliderUniform(event.target.value);
                setErr(false);
            } else {
                setErr(true);
            }
        }}
    />);
});

const UniformSlider = (props: UniformSliderProps) => {

    const [sliderVal, setSliderVal] = useState(0);
    const [sliderUniform, setSliderUniform] = useState("Uniform");

    const sliderRef = useRef<UniformSliderRef>();
    const inputRef = useRef<HTMLInputElement>();

    React.useEffect( () => {
        sliderRef.current = {
            getVal: () => {
                return sliderVal;
            },
            getUniform: () => {
                return sliderUniform;
            },
            getUUID: () => {
                return props.uuid;
            }
        };
        props.setRefCallback(sliderRef);
    });

    return (
        <Box
            sx={{
                display: 'inline-grid', // grid/inline-grid yields incorrect vertical alignment
                gridAutoColumns: '1fr',
                gap: 1,
                width: '100%',
                paddingLeft: '2.5em',
                alignItems: 'center'
            }}
        >
            <CustomTextField
                ref={inputRef}
                uuid={props.uuid}
                sliderUniform={sliderUniform}
                setSliderUniform={setSliderUniform}
            />
            <Slider
                aria-label={sliderUniform + " slider"}
                sx={{ display: 'table-cell', gridRow: '1', gridColumn: 'span 7', color: theme.palette.dracula.comment, verticalAlign: 'middle', marginLeft: '1em' }}
                value={sliderVal}
                onChange={ (event: Event, newValue: number | number[]) => {
                    setSliderVal( newValue as number)
                }}
            />
            <Button
                aria-label={"Delete " + sliderUniform + " slider"}
                sx={{
                    display: 'table-cell', gridRow: '1', gridColumn: 'span 1',
                    color: theme.palette.primary.contrastText,
                    verticalAlign: 'middle', lineHeight: '0',
                    paddingLeft: '1em', marginLeft: '3em'
                }}
                onClick={() => {
                    props.deleteCallback(props.uuid);
                }}>
                <ClearIcon/>
            </Button>
        </Box>
    );
};

export const UniformSliders = (props) => {
    const theme = useTheme();

    //const [sliderRefMap, setSliderRefMap] = useState<Map<string,React.MutableRefObject<UniformSliderRef>>>(new Map<string,React.MutableRefObject<UniformSliderRef>>());
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

    const sliderRefCallback = (ref) => {
        ref && props.setSliderRefMap(props.sliderRefMap.set(ref.current.getUUID(), ref)); // set returns 'this'
    };

    /*
        React doesn't check deeply nested references for updates,
        so we force them here instead. Note, we don't want React to update
        on the nested data here anyway, to avoid re-rendering everything
        whenever one slider changes
     */
    const deleteCallback = (uuid) => {
        props.setSliderRefMap( sliderArrayRefs => {sliderArrayRefs.delete(uuid); return sliderArrayRefs} );
        forceUpdate();
    };

    const addCallback = (uuid) => {
        uuid && props.setSliderRefMap(props.sliderRefMap.set(uuid, null));
        forceUpdate();
    };

    return (
        <Box>
        <Stack spacing={2} direction="column" sx={{ mb: 1 }} alignItems="center">
            {[...props.sliderRefMap.keys()].map(uuid => (
                <UniformSlider key={uuid} uuid={uuid} setRefCallback={sliderRefCallback} deleteCallback={deleteCallback}/>
            ))}
        </Stack>
        <Button sx={{color: theme.palette.primary.dark}}
                onClick={() => {
                    addCallback(UUID());
                }}>
            <AddIcon/>
        </Button>
        </Box>
    );
}

export default UniformSliders;
