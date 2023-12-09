import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import Logo from 'components/global/logo';
import { theme } from 'theme/theme';

export default function Banner() {
    return (
        <Alert variant={'outlined'} severity="info">
            <Typography variant={'subtitle1'} color={theme.palette.neutral.contrastText}>
                <AlertTitle>
                    <Logo /> is an experimental editor for{' '}
                    <a href="https://developer.chrome.com/articles/gpu-compute/">
                        WebGPU compute shaders
                    </a>
                    .
                </AlertTitle>
                At this time, only <a href={'https://www.google.com/chrome/'}>Chrome</a> (
                <a href="https://developer.chrome.com/blog/webgpu-release/">v113+</a>) is supported,
                as{' '}
                <a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status">
                    WebGPU is not yet fully supported by other browsers
                </a>
                .
            </Typography>
        </Alert>
    );
}
