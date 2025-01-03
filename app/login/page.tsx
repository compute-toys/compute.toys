import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CssTextField, Item } from 'theme/theme';
import { login } from './actions';

export const runtime = 'edge';

export default function LoginPage() {
    return (
        <Box sx={{ p: 4 }}>
            <Item sx={{ color: 'white' }}>
                <Typography>Enter your email address</Typography>
                <Stack direction="row" justifyContent={'center'} sx={{ marginTop: '10px' }}>
                    <form>
                        <CssTextField id="email" name="email" type="email" required />
                        <br />
                        <Button formAction={login} type="submit">
                            Login / Sign up
                        </Button>
                    </form>
                </Stack>
            </Item>
        </Box>
    );
}
