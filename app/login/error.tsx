'use client';

import Box from '@mui/material/Box/Box';
import Button from '@mui/material/Button/Button';
import { Item } from 'theme/theme';

export default function Error({
    error,
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <Box sx={{ p: 4 }}>
            <Item sx={{ color: 'white' }}>
                <h2>Something went wrong!</h2>
                <pre>{error.message}</pre>
                <Button onClick={reset}>Try again</Button>
            </Item>
        </Box>
    );
}
