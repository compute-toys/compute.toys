import Box from '@mui/material/Box';
import Link from 'next/link';

export default function NotFound() {
    return (
        <Box sx={{ p: 4 }}>
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href="/">Return Home</Link>
        </Box>
    );
}
