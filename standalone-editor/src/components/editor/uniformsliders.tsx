'use client';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import { styled, useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { useAtom, useSetAtom } from 'jotai';
import {
    manualReloadAtom,
    sliderRefMapAtom,
    sliderSerDeNeedsUpdateAtom,
    sliderUpdateSignalAtom
} from '../../lib/atoms/atoms';
import {
    ChangeEvent,
    FocusEvent,
    forwardRef,
    MutableRefObject,
    useEffect,
    useRef,
    useState
} from 'react';
import { getRainbowColor } from '../../lib/util/theme';
import { v4 as UUID } from 'uuid';

const WGPU_CONTEXT_MAX_UNIFORMS = 32;

export interface UniformActiveSettings {
    name: string;
    value: number;
    minRange: number;
    maxRange: number;
}

export interface UniformSliderRef {
    getVal: () => number;
    getUniform: () => string;
    getUUID: () => string;
    getMinRange: () => number;
    getMaxRange: () => number;
}

interface UniformSliderProps {
    setRefCallback: (r: UniformSliderRef) => void;
    deleteCallback: (uuid: string) => void;
    uuid: string;
    index: number;
    sliderRefMap: Map<string, UniformSliderRef>;
}

export const fromUniformActiveSettings = (sliderSerDeArray: Array<UniformActiveSettings>) => {
    const sliderRefMap = new Map<string, UniformSliderRef>();

    sliderSerDeArray.forEach((slider: UniformActiveSettings) => {
        const uuid = UUID();
        const sliderRef: UniformSliderRef = {
            getVal: () => {
                return slider.value;
            },
            getUniform: () => {
                return slider.name;
            },
            getUUID: () => {
                return uuid;
            },
            getMinRange: () => {
                return slider.minRange;
            },
            getMaxRange: () => {
                return slider.maxRange;
            }
        };
        sliderRefMap.set(uuid, sliderRef);
    });

    return sliderRefMap;
};

// needs float: left to avoid drifting away from the absolute-positioned label
const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.dracula.currentLine
        },
        '&:hover fieldset': {
            borderColor: theme.palette.dracula.currentLine
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.dracula.foreground
        },
        '&.Mui-focused input': {
            color: theme.palette.dracula.foreground
        },
        '& input:disabled': {
            color: theme.status.disabled,
            WebkitTextFillColor: theme.status.disabled
        },
        float: 'left'
    }
}));

const validate = (text: string, this_uuid: string, sliderRefMap: Map<string, UniformSliderRef>) => {
    const matched = text.match(/^[a-zA-Z][a-zA-Z0-9_]*$/);
    const nameValid = matched && matched.length === 1;
    const foundDuplicate = [...sliderRefMap.keys()].find(uuid => {
        return this_uuid !== uuid && sliderRefMap.get(uuid)!.getUniform() === text;
    });
    return nameValid && !foundDuplicate;
};

const CustomTextField = forwardRef(
    (
        props: {
            sliderUniform: string;
            uuid: string;
            sliderRefMap: Map<string, UniformSliderRef>;
            setSliderUniform: (value: string) => void;
            index: number;
        },
        inputRef: MutableRefObject<HTMLInputElement>
    ) => {
        const theme = useTheme();
        /*
        Avoid re-rendering the containing (parent) component
        by storing in-progress edits in local state
     */
        const [temporaryFieldValue, setTemporaryFieldValue] = useState('Uniform');
        const [err, setErr] = useState(false);
        const setManualReload = useSetAtom(manualReloadAtom);

        useEffect(() => {
            setTemporaryFieldValue(props.sliderUniform);
        }, [props.sliderUniform]);

        const onEnterKey = event => {
            if (event.keyCode === 13) {
                // enter
                inputRef.current.blur();
            }
        };

        return (
            <StyledTextField
                error={err}
                id="outlined-name"
                aria-label={'Uniform name input'}
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 3',
                    verticalAlign: 'middle',
                    input: { color: getRainbowColor(props.index, theme) },
                    label: { color: getRainbowColor(props.index, theme) }
                }}
                inputRef={inputRef}
                size="small"
                label={err ? 'Invalid' : 'Name'}
                value={temporaryFieldValue}
                onKeyDown={onEnterKey}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setTemporaryFieldValue(event.target.value);
                }}
                onBlur={(event: FocusEvent<HTMLInputElement>) => {
                    if (validate(event.target.value, props.uuid, props.sliderRefMap)) {
                        props.setSliderUniform(event.target.value);
                        setManualReload(true);
                        setErr(false);
                    } else {
                        setErr(true);
                    }
                }}
            />
        );
    }
);

CustomTextField.displayName = 'CustomTextField';

const UniformSlider = (props: UniformSliderProps) => {
    const theme = useTheme();
    //const initFromHost = props.sliderSerDeArray[props.index] !== undefined;
    const initFromHost = props.sliderRefMap.has(props.uuid) && props.sliderRefMap.get(props.uuid);

    const [sliderVal, setSliderVal] = useState(
        initFromHost ? props.sliderRefMap.get(props.uuid)!.getVal() : 0
    );
    const [sliderUniform, setSliderUniform] = useState(
        initFromHost ? props.sliderRefMap.get(props.uuid)!.getUniform() : 'uniform_' + props.index
    );
    const [sliderMinRange, setSliderMinRange] = useState(
        props.sliderRefMap.get(props.uuid)?.getMinRange() || 0
    );
    const [sliderMaxRange, setSliderMaxRange] = useState(
        props.sliderRefMap.get(props.uuid)?.getMaxRange() || 1
    );

    const setSliderUpdateSignal = useSetAtom(sliderUpdateSignalAtom);

    let sliderRef: UniformSliderRef;
    const inputRef = useRef<HTMLInputElement>(null);

    // TODO: check if dependency array can be more restrictive here
    useEffect(() => {
        sliderRef = {
            getVal: () => {
                return sliderVal;
            },
            getUniform: () => {
                return sliderUniform;
            },
            getUUID: () => {
                return props.uuid;
            },
            getMinRange: () => {
                return sliderMinRange;
            },
            getMaxRange: () => {
                return sliderMaxRange;
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
                color: getRainbowColor(props.index, theme)
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
            <StyledTextField
                label="Min"
                type="number"
                size="small"
                value={sliderMinRange}
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 1',
                    verticalAlign: 'middle',
                    input: { color: getRainbowColor(props.index, theme) },
                    label: { color: getRainbowColor(props.index, theme) }
                }}
                InputLabelProps={{
                    shrink: true
                }}
                onChange={e => {
                    const val = +e.target.value;
                    if (val < sliderMaxRange) {
                        setSliderMinRange(val);
                    }
                }}
            />
            <Slider
                aria-label={sliderUniform + ' slider'}
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 7',
                    verticalAlign: 'middle',
                    color: getRainbowColor(props.index, theme)
                }}
                defaultValue={0.0}
                step={0.001}
                min={sliderMinRange}
                max={sliderMaxRange}
                valueLabelDisplay="auto"
                value={sliderVal}
                onChange={(event: Event, newValue: number | number[]) => {
                    setSliderVal(newValue as number);
                }}
            />
            <StyledTextField
                label="Max"
                type="number"
                size="small"
                value={sliderMaxRange}
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 1',
                    verticalAlign: 'middle',
                    input: { color: getRainbowColor(props.index, theme) },
                    label: { color: getRainbowColor(props.index, theme) }
                }}
                InputLabelProps={{
                    shrink: true
                }}
                onChange={e => {
                    const val = +e.target.value;
                    if (val > sliderMinRange) {
                        setSliderMaxRange(val);
                    }
                }}
            />

            <Button
                aria-label={'Delete ' + sliderUniform + ' slider'}
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 1',
                    color: theme.palette.dracula.foreground,
                    verticalAlign: 'middle',
                    lineHeight: '0',
                    padding: '0px',
                    marginLeft: '2em',
                    marginRight: '8px',
                    minWidth: '32px'
                }}
                onClick={() => {
                    props.deleteCallback(props.uuid);
                }}
            >
                <ClearIcon />
            </Button>
        </Box>
    );
};

export default function UniformSliders() {
    const theme = useTheme();

    // keeps a count of sliders and also force an update when the count changes
    const [sliderCount, setSliderCount] = useState(0);
    const [sliderSerDeNeedsUpdate, setSliderSerDeNeedsUpdate] = useAtom(sliderSerDeNeedsUpdateAtom);
    const [sliderRefMap, setSliderRefMap] = useAtom(sliderRefMapAtom);

    const setManualReload = useSetAtom(manualReloadAtom);

    const sliderRefCallback = ref => {
        if (ref) setSliderRefMap(sliderRefMap.set(ref.getUUID(), ref)); // set returns 'this'
    };

    /*
        React doesn't check deeply nested references for updates,
        so we force them here instead. Note, we don't want React to update
        on the nested data here anyway, to avoid re-rendering everything
        whenever one slider changes
     */
    const deleteCallback = uuid => {
        setSliderRefMap(sliderArrayRefs => {
            sliderArrayRefs.delete(uuid);
            return sliderArrayRefs;
        });
        setSliderCount(sliderCount - 1);
        // recompile with new prelude
        setManualReload(true);
    };

    const addCallback = uuid => {
        const sliderRef: UniformSliderRef = {
            getVal: () => {
                return 0;
            },
            getUniform: () => {
                return 'uniform_' + (sliderCount + 1);
            },
            getUUID: () => {
                return uuid;
            },
            getMaxRange: () => {
                return 1;
            },
            getMinRange: () => {
                return 0;
            }
        };
        if (uuid) setSliderRefMap(sliderRefMap.set(uuid, sliderRef));
        setSliderCount(sliderCount + 1);
        // recompile with new prelude
        setManualReload(true);
    };

    useEffect(() => {
        if (sliderSerDeNeedsUpdate) {
            setSliderCount([...sliderRefMap.keys()].length);
            setSliderSerDeNeedsUpdate(false);
            setManualReload(true);
        }
    });

    const uniformTitle =
        sliderCount > 0 ? (
            <span
                style={{ color: theme.palette.dracula.foreground }}
            >{`Uniforms [${sliderCount}]`}</span>
        ) : (
            <span style={{ color: theme.status.disabled }}>Uniforms</span>
        );

    return (
        <Accordion
            sx={{
                color: theme.palette.dracula.foreground,
                backgroundColor: theme.palette.primary.darker
            }}
        >
            <AccordionSummary
                sx={{ fontSize: 14 }}
                expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.dracula.foreground }} />}
                aria-controls="uniform-accordion"
                id="uniform-accordion"
            >
                {uniformTitle}
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '0px 2px 8px' }}>
                <Box sx={{ maxHeight: '30vh', overflow: 'auto' }}>
                    <Stack
                        spacing={2}
                        direction="column"
                        sx={{ mb: 1 }}
                        alignItems="center"
                        marginTop="32px"
                    >
                        {[...sliderRefMap.keys()].map((uuid, index) => (
                            <UniformSlider
                                key={uuid}
                                uuid={uuid}
                                index={index}
                                sliderRefMap={sliderRefMap}
                                setRefCallback={sliderRefCallback}
                                deleteCallback={deleteCallback}
                            />
                        ))}
                    </Stack>
                    {sliderCount < WGPU_CONTEXT_MAX_UNIFORMS ? (
                        <Button
                            sx={{ color: theme.palette.primary.light, padding: '0px' }}
                            onClick={() => {
                                addCallback(UUID());
                            }}
                        >
                            <AddIcon />
                        </Button>
                    ) : null}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}
