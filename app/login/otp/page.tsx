import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CssTextField, Item } from 'theme/theme';
import { verify } from '../actions';

export const runtime = 'edge';

export default async function LoginPage({ searchParams }) {
    const email = (await searchParams).email;
    return (
        <Box sx={{ p: 4 }}>
            <Item sx={{ color: 'white' }}>
                <Typography>Enter the code sent to {email}</Typography>
                <Stack direction="row" justifyContent={'center'} sx={{ marginTop: '10px' }}>
                    <form>
                        <input id="email" name="email" type="hidden" value={email} />
                        <CssTextField
                            id="token"
                            name="token"
                            type="text"
                            autoComplete="off"
                            required
                        />
                        <br />
                        <Button formAction={verify} type="submit" sx={{ marginTop: '5px' }}>
                            Login / Sign up
                        </Button>
                    </form>
                </Stack>
            </Item>
        </Box>
    );
}
