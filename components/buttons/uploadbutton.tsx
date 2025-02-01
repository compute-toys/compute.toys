import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import Button from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';
import { ChangeEventHandler } from 'react';

type UploadButtonProps = {
    onUpload: ChangeEventHandler<HTMLInputElement>;
    sx?: SxProps<Theme>;
    iconSx?: SxProps<Theme>;
    loading: boolean;
};

export default function UploadButton(props: UploadButtonProps) {
    return (
        <Button component="label" disabled={props.loading} aria-label="add-image" sx={props.sx}>
            <input
                hidden
                type="file"
                onChange={props.onUpload}
                accept="image/*"
                style={{
                    //make this hidden and display only the icon
                    position: 'absolute',
                    outline: 'none'
                }}
            />
            <AddAPhotoIcon sx={props.iconSx} />
        </Button>
    );
}
