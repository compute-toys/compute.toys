import { ChangeEventHandler } from 'react'
import {Button, Fab} from "@mui/material";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

export type UploadButtonProps = {
    onUpload: ChangeEventHandler<HTMLInputElement>
    color: string
    loading: boolean
}

export default function UploadButton(props: UploadButtonProps) {
    return (
        <Button
            component="label"
            disabled={props.loading}
            aria-label="add-image"
            sx={{ position: "fixed", overflow: "hidden", color: props.color }}
        >
            <input
                hidden
                type="file"
                onChange={props.onUpload}
                accept="image/*"
                style={{ //make this hidden and display only the icon
                    position: "absolute",
                    outline: "none"
                }}
            />
            <AddAPhotoIcon />
        </Button>
    )
}