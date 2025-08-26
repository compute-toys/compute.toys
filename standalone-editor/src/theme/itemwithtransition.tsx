'use client';
import Paper, { PaperProps } from '@mui/material/Paper';
import { styled, useTheme } from '@mui/material/styles';
import { useAtom, WritableAtom } from 'jotai';

// Item component that uses theme from context
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.primary.darker,
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
}));

interface ItemWithTransitionSignalProps extends PaperProps {
    transitionAtom: WritableAtom<string | false, [string | false], void>;
}

export const ItemWithTransitionSignal = (props: ItemWithTransitionSignalProps) => {
    const theme = useTheme();
    const [transition, setTransition] = useAtom(props.transitionAtom);
    if (transition) {
        setTimeout(() => {
            setTransition(false);
        }, 100);
    }
    const transitionColor = transition ? transition : theme.palette.primary.darker;
    return (
        <Item
            sx={{
                ...props.sx,
                transition: 'background-color 0.1s ease-out',
                backgroundColor: transitionColor
            }}
        >
            {props.children}
        </Item>
    );
};
