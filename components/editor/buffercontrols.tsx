'use client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useAtom } from 'jotai';
import { bufferControlRefMapAtom } from 'lib/atoms/atoms';
import { getRainbowColor, theme } from 'theme/theme';

import { useEffect } from 'react';///

export interface BufferControlRef {
    getUUID: () => string;
    getBufferName: () => string;
}

interface BufferControlProps {
    uuid: string;
    index: number;
    bufferControlRefMap: Map<string, BufferControlRef>;
}

const BufferControl = (props: BufferControlProps) => {
    useEffect(() => {///
        console.log(`Buffer UUID="${props.uuid}" Name="${props.bufferControlRefMap.get(props.uuid)?.getBufferName()}"`);
    }, []);

    const bufferName = props.bufferControlRefMap.get(props.uuid)?.getBufferName();

    return (
        <Box
            sx={{
                display: 'inline-grid', // grid/inline-grid yields incorrect vertical alignment
                gridAutoColumns: '1fr',
                gap: 1,
                width: '100%',
                paddingLeft: '0em',
                alignItems: 'center',
                color: getRainbowColor(props.index)
            }}
        >
            <Box
                aria-label="Buffer Name"
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 1',
                    padding: '14px',
                    textAlign: 'left',
                    verticalAlign: 'middle',
                    color: getRainbowColor(props.index)
                }}
            >
                {bufferName}
            </Box>
            <Button
                aria-label="Dump Contents"
                variant="outlined"
                sx={{
                    display: 'table-cell',
                    gridRow: '1',
                    gridColumn: 'span 3',
                    color: theme.palette.dracula.foreground,
                    verticalAlign: 'middle',
                    width: 'fit-content'
                }}
                onClick={() => {
                    console.log(`Dumped ${bufferName}`);
                }}
            >
                Dump Contents
            </Button>
        </Box>
    );
};

export default function BufferControls() {
    const theme = useTheme();

    const [bufferControlRefMap, setBufferControlRefMap] = useAtom(bufferControlRefMapAtom);

    const bufferTitle =
        bufferControlRefMap.size > 0 ? (
            <span
                style={{ color: theme.palette.dracula.foreground }}
            >{`Buffers [${bufferControlRefMap.size}]`}</span>
        ) : (
            <span style={{ color: theme.status.disabled }}>Buffers</span>
        );

    return (
        <Accordion
            sx={{
                color: theme.palette.dracula.foreground,
                backgroundColor: theme.palette.primary.darker
            }}
        >
            <AccordionSummary
                sx={{ fontSize: 14 }}
                expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.dracula.foreground }} />}
                aria-controls="buffer-accordion"
                id="buffer-accordion"
            >
                {bufferTitle}
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '0px 2px 8px' }}>
                <Box sx={{ maxHeight: '30vh', overflow: 'auto' }}>
                    <Stack
                        spacing={2}
                        direction="column"
                        sx={{ mb: 1 }}
                        alignItems="center"
                        marginTop="32px"
                    >
                        {[...bufferControlRefMap.keys()].map((uuid, index) => (
                            <BufferControl
                                key={uuid}
                                uuid={uuid}
                                index={index}
                                bufferControlRefMap={bufferControlRefMap}
                            />
                        ))}
                    </Stack>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}
