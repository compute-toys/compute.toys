import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import {getRainbowColor, Item} from '../theme/theme';
import {Skeleton} from "@mui/material";

export default function EntryPointDisplay(props) {
    return (
        <Item sx={{display: "inline-block", marginTop: "18px"}}>
            <Timeline sx={{alignItems: "baseline", padding: "0px"}}>
                {props.entryPoints.map((entryPoint, index) => (
                    <TimelineItem key={entryPoint} sx={index < props.entryPoints.length - 1 ? {} : {minHeight: "35px"}}>
                        <TimelineSeparator>
                            <TimelineDot sx={{backgroundColor: getRainbowColor(index)}}/>
                            {index < props.entryPoints.length - 1 ? <TimelineConnector /> : null}
                        </TimelineSeparator>
                        <TimelineContent color={getRainbowColor(index)}>{entryPoint}</TimelineContent>
                    </TimelineItem>
                ))}
                {props.entryPoints.length === 0 ? <Skeleton variant="rectangular"
                                                            width={128}
                                                            height={100}/> : null}
            </Timeline>
        </Item>
    );
}