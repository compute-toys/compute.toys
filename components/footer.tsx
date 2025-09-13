import '@fortawesome/fontawesome-svg-core/styles.css';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
// import Link from 'next/link';

export default function Footer() {
    return (
        <Container maxWidth={false} sx={{ py: 3 }}>
            <Grid container spacing={4} justifyContent="center">
                <Grid item>
                    <a href="https://discord.gg/pNzH6gFQ2T">
                        <FontAwesomeIcon icon={faDiscord} /> Join us on Discord
                    </a>
                </Grid>
                <Grid item>
                    <a href="https://github.com/compute-toys">
                        <FontAwesomeIcon icon={faGithub} /> Code on GitHub
                    </a>
                </Grid>
            </Grid>
        </Container>
    );
}
