'use client';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Skeleton from '@mui/material/Skeleton';
import { useAtomValue } from 'jotai';
import { codeAtom, entryPointsAtom, monacoEditorAtom } from 'lib/atoms/atoms';
import { getRainbowColor, Item } from '../../theme/theme';

export default function EntryPointDisplay() {
    const entryPoints = useAtomValue(entryPointsAtom);
    const code = useAtomValue(codeAtom);
    const monaco = useAtomValue(monacoEditorAtom);

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
        >
            <Timeline sx={{ alignItems: 'baseline', padding: '0px' }}>
                {entryPoints.map((entryPoint, index) => (
                    <TimelineItem
                        key={entryPoint}
                        sx={index < entryPoints.length - 1 ? {} : { minHeight: '2px' }}
                    >
                        <TimelineSeparator>
                            <TimelineDot sx={{ backgroundColor: getRainbowColor(index) }} />
                            {index < entryPoints.length - 1 ? <TimelineConnector /> : null}
                        </TimelineSeparator>
                        <TimelineContent color={getRainbowColor(index)}>
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => editorJumpToEntryPoint(entryPoint)}
                            >
                                {entryPoint}
                            </span>
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
