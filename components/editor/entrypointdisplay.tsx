'use client';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useAtomValue } from 'jotai';
import {
    codeAtom,
    entryPointsAtom,
    entryTimersAtom,
    monacoEditorAtom,
    profilerEnabledAtom
} from 'lib/atoms/atoms';
import { useEffect, useState } from 'react';
import { theme } from 'theme/theme';
import { getRainbowColor, Item } from '../../theme/theme';

export default function EntryPointDisplay() {
    const entryPoints = useAtomValue(entryPointsAtom);
    const entryTimers = useAtomValue(entryTimersAtom);
    const profilerEnabled = useAtomValue(profilerEnabledAtom);
    const code = useAtomValue(codeAtom);
    const monaco = useAtomValue(monacoEditorAtom);

    const [updateTrigger, setUpdateTrigger] = useState(0);
    useEffect(() => {
        setTimeout(() => {
            setUpdateTrigger(x => x + 1);
        }, 0);
    }, [profilerEnabled, entryTimers]);

    function editorJumpToEntryPoint(entryPoint: string) {
        const regex = new RegExp('fn\\s+' + entryPoint + '\\s*\\(');
        const charid = code.search(regex);
        let lineid = 0;
        for (let i = 0; i < charid; i++) {
            if (code[i] === '\n') {
                lineid++;
            }
        }
        if (monaco) {
            monaco.revealLineNearTop(lineid, 0);
        }
    }

    return (
        <Item
            sx={{
                display: 'inline-block',
                marginTop: '18px',
                minHeight: '-webkit-fill-available'
            }}
            style={{ minHeight: '-moz-fill-available' }}
            key={updateTrigger}
        >
            <Timeline sx={{ alignItems: 'stretch', width: '100%', padding: '0 1rem' }}>
                {entryPoints.map((entryPoint, index) => (
                    <TimelineItem
                        key={`${entryPoint}-${entryTimers[index]}-${updateTrigger}`}
                        sx={{
                            width: '100%',
                            minHeight: '48px',
                            '&:before': {
                                display: 'none'
                            }
                        }}
                    >
                        <TimelineSeparator>
                            <TimelineDot sx={{ backgroundColor: getRainbowColor(index) }} />
                            {index < entryPoints.length - 1 ? <TimelineConnector /> : null}
                        </TimelineSeparator>
                        <TimelineContent color={getRainbowColor(index)}>
                            <Box
                                style={{
                                    cursor: 'pointer'
                                }}
                                onClick={() => editorJumpToEntryPoint(entryPoint)}
                            >
                                <span>{entryPoint}</span>
                            </Box>
                            <Box
                                style={{
                                    color: theme.palette.dracula.foreground,
                                    textAlign: 'right',
                                    fontSize: '0.8rem',
                                    lineHeight: '.9rem'
                                }}
                            >
                                {profilerEnabled ? entryTimers[index] : ''}
                            </Box>
                        </TimelineContent>
                    </TimelineItem>
                ))}
                {entryPoints.length === 0 ? (
                    <Skeleton variant="rectangular" width={128} height={100} />
                ) : null}
            </Timeline>
        </Item>
    );
}
