import {ChangeEvent, FocusEvent, forwardRef, MutableRefObject, useEffect, useReducer, useRef, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {Button, Slider, Stack, TextField} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";
import {CssTextField, getRainbowColor, theme} from "../theme/theme";
import { v4 as UUID } from 'uuid';
import {sliderRefMapAtom, sliderSerDeArrayAtom, sliderSerDeNeedsUpdateAtom} from "../lib/atoms";
import {useAtom, useAtomValue} from "jotai";
import {UniformActiveSettings} from "../lib/serializeshader";


export interface UniformSliderRef {
    getVal: () => number;
    getUniform: () => string;
    getUUID: () => string;
}

interface UniformSliderProps {
    setRefCallback: (r: React.MutableRefObject<UniformSliderRef>) => void
    deleteCallback: (uuid: string) => void
    uuid: string
    index: number
    sliderSerDeArray: Array<UniformActiveSettings>
}

const validate = (text: string) => {
    let matched = text.match(/^[a-zA-Z][a-zA-Z0-9_]*$/);
    return (matched && matched.length === 1);
}

const CustomTextField = forwardRef((props: any, inputRef: MutableRefObject<any>) => {
    /*
        Avoid re-rendering the containing (parent) component
        by storing in-progress edits in local state
     */
    const [temporaryFieldValue, setTemporaryFieldValue] = useState("Uniform");
    const [err, setErr] = useState(false);

    useEffect(() => {
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
            gridColumn: 'span 3',
            verticalAlign: 'middle',
            input: {color: getRainbowColor(props.index)},
            label: {color: getRainbowColor(props.index)}
        }}
        inputRef={inputRef}
        size="small"
        label={err ? "Invalid" : "Name"}
        value={temporaryFieldValue}
        onKeyDown={onEnterKey}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {setTemporaryFieldValue(event.target.value)}}
        onBlur={ (event: FocusEvent<HTMLInputElement>) => {
            if (validate(event.target.value)) {
                props.setSliderUniform(event.target.value);
                setErr(false);
            } else {
                setErr(true);
            }
        }}
    />);
});

CustomTextField.displayName = "CustomTextField";

const UniformSlider = (props: UniformSliderProps) => {

    const initFromHost = typeof props.sliderSerDeArray[props.index] !== 'undefined';

    const [sliderVal, setSliderVal] = useState(initFromHost ? 0 : props.sliderSerDeArray[props.index].value);
    const [sliderUniform, setSliderUniform] = useState(initFromHost ? props.sliderSerDeArray[props.index].name : "uniform_" + props.index);

    const sliderRef = useRef<UniformSliderRef>();
    const inputRef = useRef<HTMLInputElement>();

    // TODO: check if dependency array can be more restrictive here
    useEffect( () => {
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
                paddingLeft: '0em',
                alignItems: 'center',
                color: getRainbowColor(props.index)
            }}
        >
            <CustomTextField
                index={props.index}
                ref={inputRef}
                uuid={props.uuid}
                sliderUniform={sliderUniform}
                setSliderUniform={setSliderUniform}
            />
            <Slider
                aria-label={sliderUniform + " slider"}
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 7',
                    verticalAlign: 'middle',
                    marginLeft: '1em',
                    color: getRainbowColor(props.index)
                }}
                defaultValue={0.0}
                step={0.001}
                min={0.0}
                max={1.0}
                valueLabelDisplay="auto"
                value={sliderVal}
                onChange={ (event: Event, newValue: number | number[]) => {
                    setSliderVal( newValue as number)
                }}
            />
            <Button
                aria-label={"Delete " + sliderUniform + " slider"}
                sx={{
                    display: 'table-cell', gridRow: '1', gridColumn: 'span 1',
                    color: theme.palette.dracula.foreground,
                    verticalAlign: 'middle', lineHeight: '0',
                    padding: '0px', marginLeft: '2em', marginRight: '8px',
                    minWidth: '32px'
                }}
                onClick={() => {
                    props.deleteCallback(props.uuid);
                }}>
                <ClearIcon/>
            </Button>
        </Box>
    );
};

export const UniformSliders = () => {
    const theme = useTheme();

    // recommended pattern for forcing an update with a simple counter
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

    const [sliderRefMap, setSliderRefMap] = useAtom(sliderRefMapAtom);

    const sliderRefCallback = (ref) => {
        ref && setSliderRefMap(sliderRefMap.set(ref.current.getUUID(), ref)); // set returns 'this'
    };

    /*
        React doesn't check deeply nested references for updates,
        so we force them here instead. Note, we don't want React to update
        on the nested data here anyway, to avoid re-rendering everything
        whenever one slider changes
     */
    const deleteCallback = (uuid) => {
        setSliderRefMap( sliderArrayRefs => {sliderArrayRefs.delete(uuid); return sliderArrayRefs} );
        forceUpdate();
    };

    const addCallback = (uuid) => {
        uuid && setSliderRefMap(sliderRefMap.set(uuid, null));
        forceUpdate();
    };

    const sliderSerDeArray = useAtomValue(sliderSerDeArrayAtom);
    const [sliderSerDeNeedsUpdate, setSliderSerDeNeedsUpdate] = useAtom(sliderSerDeNeedsUpdateAtom);

    useEffect(() => {
        if (sliderSerDeNeedsUpdate) {
            sliderRefMap.clear();
            sliderSerDeArray.forEach(() => {addCallback(UUID())})
            setSliderSerDeNeedsUpdate(false);
        }
    }, [sliderSerDeNeedsUpdate])

    return (
        <Box>
            <Stack spacing={2} direction="column" sx={{ mb: 1 }} alignItems="center">
                {[...sliderRefMap.keys()].map((uuid, index) => (
                    <UniformSlider key={uuid} uuid={uuid} index={index} sliderSerDeArray={sliderSerDeArray} setRefCallback={sliderRefCallback} deleteCallback={deleteCallback}/>
                ))}
            </Stack>
            <Button sx={{color: theme.palette.primary.light, padding: "0px"}}
                    onClick={() => {
                        addCallback(UUID());
                    }}>
                <AddIcon/>
            </Button>
        </Box>
    );
}

export default UniformSliders;
