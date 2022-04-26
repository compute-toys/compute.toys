import {ChangeEvent} from "react";
import {CssTextField, Item, theme} from "../theme/theme";
import {Button, FormControl, Grid, InputBase, InputLabel, MenuItem, Select} from "@mui/material";
import {useAtom, useAtomValue} from "jotai";
import {descriptionAtom, titleAtom, Visibility, visibilityAtom} from "../lib/atoms";
import {styled} from "@mui/material/styles";
import {
    shadowCanvasElAtom,
    shadowCanvasToDataUrl
} from "./shadowcanvas";
import {canvasElAtom} from "../lib/wgputoyatoms";

const VisibilityInput = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        paddingTop: '14px',
        paddingLeft: '14px',
    },
    '& .MuiSelect-icon': {
        color: theme.palette.dracula.foreground,
        marginTop: '5px'
    },
}));

export const MetadataEditor = () => {
    const [title, setTitle] = useAtom(titleAtom);
    const [description, setDescription] = useAtom(descriptionAtom);
    const [visibility, setVisibility] = useAtom(visibilityAtom);
    const shadowCanvasEl = useAtomValue(shadowCanvasElAtom);
    const canvasEl = useAtomValue(canvasElAtom);
    return (
        <Item sx={{textAlign: "left", marginTop: "20px"}}>
            <Grid container spacing={2} sx={{padding: "10px"}}>
                <Grid item xs={8}>
                    <CssTextField
                        fullWidth
                        id="outlined-name"
                        aria-label={"Title input"}
                        size="medium"
                        label={"Title"}
                        value={title}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {setTitle(event.target.value)}}
                        sx={{
                            input: {color: theme.palette.dracula.red},
                            label: {color: theme.palette.dracula.red}
                        }}
                        inputProps={{style: {fontSize: "1.25em", height: "1.0em"}}}
                    />
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel id="visibility-select-input-label">Visibility</InputLabel>
                        <Select
                            labelId="visbility-select-label"
                            id="visibility-select"
                            value={visibility}
                            label="Visibility"
                            input={<VisibilityInput/>}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {setVisibility(event.target.value as Visibility)}}
                        >
                            <MenuItem value={'private'}>private</MenuItem>
                            <MenuItem value={'unlisted'}>unlisted</MenuItem>
                            <MenuItem value={'public'}>public</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <CssTextField
                        multiline
                        fullWidth
                        id="outlined-name"
                        aria-label={"Description input"}
                        size="small"
                        label={"Description"}
                        value={description}
                        rows={3}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {setDescription(event.target.value)}}
                        sx ={{
                            input: {color: theme.palette.dracula.purple},
                            label: {color: theme.palette.dracula.purple}
                        }}
                    />
                </Grid>
            </Grid>
            <Grid item xs={8}></Grid>
            <Grid item xs={4}>
                <Button onClick={async () => {
                    const str = await shadowCanvasToDataUrl(canvasEl, shadowCanvasEl);
                    console.log(str);
                }}>Save</Button>
            </Grid>
        </Item>
    );
};