import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { CssTextField, Item } from 'theme/theme';
import { login } from './actions';
import Error from './error';

export default function LoginPage() {
    return (
        <ErrorBoundary errorComponent={Error}>
            <Box sx={{ p: 4 }}>
                <Item sx={{ color: 'white' }}>
                    <Typography>Enter your email address</Typography>
                    <Stack direction="row" justifyContent={'center'} sx={{ marginTop: '10px' }}>
                        <form>
                            <CssTextField id="email" name="email" type="email" required />
                            <br />
                            <Button formAction={login} type="submit" sx={{ marginTop: '10px' }}>
                                Login / Sign up
                            </Button>
                        </form>
                    </Stack>
                </Item>
            </Box>
        </ErrorBoundary>
    );
}
