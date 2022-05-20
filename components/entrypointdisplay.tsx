import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import {getRainbowColor, Item} from '../theme/theme';
import {Skeleton} from "@mui/material";
import {useAtomValue} from "jotai";
import {entryPointsAtom} from "lib/atoms";

export default function EntryPointDisplay() {
    const entryPoints = useAtomValue(entryPointsAtom);
    return (
        <Item sx={{display: "inline-block", marginTop: "18px"}}>
            <Timeline sx={{alignItems: "baseline", padding: "0px"}}>
                {entryPoints.map((entryPoint, index) => (
                    <TimelineItem key={entryPoint} sx={index < entryPoints.length - 1 ? {} : {minHeight: "35px"}}>
                        <TimelineSeparator>
                            <TimelineDot sx={{backgroundColor: getRainbowColor(index)}}/>
                            {index < entryPoints.length - 1 ? <TimelineConnector /> : null}
                        </TimelineSeparator>
                        <TimelineContent color={getRainbowColor(index)}>{entryPoint}</TimelineContent>
                    </TimelineItem>
                ))}
                {entryPoints.length === 0 ? <Skeleton variant="rectangular"
                                                            width={128}
                                                            height={100}/> : null}
            </Timeline>
        </Item>
    );
}