import {ChangeEvent, FocusEvent, forwardRef, MutableRefObject, useEffect, useRef, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {Accordion, AccordionDetails, AccordionSummary, Button, Slider, Stack, TextField} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";
import {CssTextField, getRainbowColor, theme} from "theme/theme";
import { v4 as UUID } from 'uuid';
import {
    manualReloadAtom,
    sliderRefMapAtom,
    sliderSerDeArrayAtom,
    sliderSerDeNeedsUpdateAtom,
    sliderUpdateSignalAtom
} from "lib/atoms/atoms";
import {useAtom, useAtomValue} from "jotai";
import {UniformActiveSettings} from "lib/db/serializeshader";
import {useUpdateAtom} from "jotai/utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const WGPU_CONTEXT_MAX_UNIFORMS = 16;

export interface UniformSliderRef {
    getVal: () => number;
    getUniform: () => string;
    getUUID: () => string;
}

interface UniformSliderProps {
    setRefCallback: (r: MutableRefObject<UniformSliderRef>) => void
    deleteCallback: (uuid: string) => void
    uuid: string
    index: number
    sliderSerDeArray: Array<UniformActiveSettings>
    sliderRefMap: Map<string,MutableRefObject<UniformSliderRef>>
}

const validate = (text: string, this_uuid: string, sliderRefMap: Map<string,MutableRefObject<UniformSliderRef>>) => {
    let matched = text.match(/^[a-zA-Z][a-zA-Z0-9_]*$/);
    const nameValid = (matched && matched.length === 1);
    const foundDuplicate = [...sliderRefMap.keys()].find((uuid, index) => {
        return this_uuid !== uuid && sliderRefMap.get(uuid).current.getUniform() === text
    });
    return nameValid && !foundDuplicate;
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
            if (validate(event.target.value, props.uuid, props.sliderRefMap)) {
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

    const initFromHost = props.sliderSerDeArray[props.index] !== undefined;

    const [sliderVal, setSliderVal] = useState(initFromHost ? props.sliderSerDeArray[props.index].value : 0);
    const [sliderUniform, setSliderUniform] = useState(initFromHost ? props.sliderSerDeArray[props.index].name : "uniform_" + props.index);
    const setSliderUpdateSignal = useUpdateAtom(sliderUpdateSignalAtom);

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
        setSliderUpdateSignal(true);
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
                sliderRefMap={props.sliderRefMap}
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

    // keeps a count of sliders and also force an update when the count changes
    const [sliderCount, setSliderCount] = useState(0);

    const [sliderRefMap, setSliderRefMap] = useAtom(sliderRefMapAtom);

    const setManualReload = useUpdateAtom(manualReloadAtom);

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
        setSliderCount(sliderCount - 1);
        // recompile with new prelude
        setManualReload(true);
    };

    const addCallback = (uuid) => {
        uuid && setSliderRefMap(sliderRefMap.set(uuid, null));
        setSliderCount(sliderCount + 1);
        // recompile with new prelude
        setManualReload(true);
    };

    const sliderSerDeArray = useAtomValue(sliderSerDeArrayAtom);
    const [sliderSerDeNeedsUpdate, setSliderSerDeNeedsUpdate] = useAtom(sliderSerDeNeedsUpdateAtom);

    useEffect(() => {
        if (sliderSerDeNeedsUpdate) {
            sliderRefMap.clear();
            sliderSerDeArray.forEach(() => {addCallback(UUID())});
            setSliderSerDeNeedsUpdate(false);
        }
    }, [sliderSerDeNeedsUpdate])

    return (
        <Accordion sx={{color: theme.palette.dracula.foreground, backgroundColor: theme.palette.primary.darker}}>
            <AccordionSummary
                sx={{fontSize: 14}}
                expandIcon={<ExpandMoreIcon sx={{color: theme.palette.dracula.foreground}}/>}
                aria-controls="uniform-accordion"
                id="uniform-accordion"
            >Uniforms</AccordionSummary>
            <AccordionDetails sx={{padding: "0px 2px 8px"}}>
                <Box>
                    <Stack spacing={2} direction="column" sx={{ mb: 1 }} alignItems="center">
                        {[...sliderRefMap.keys()].map((uuid, index) => (
                            <UniformSlider key={uuid} uuid={uuid} index={index} sliderSerDeArray={sliderSerDeArray} sliderRefMap={sliderRefMap} setRefCallback={sliderRefCallback} deleteCallback={deleteCallback}/>
                        ))}
                    </Stack>
                    {sliderCount < WGPU_CONTEXT_MAX_UNIFORMS ?
                        <Button sx={{color: theme.palette.primary.light, padding: "0px"}}
                                onClick={() => {
                                    addCallback(UUID());
                                }}>
                            <AddIcon/>
                        </Button>
                    : null
                    }
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

export default UniformSliders;
