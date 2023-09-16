import { PaperProps } from '@mui/material/Paper';
import { useAtom, WritableAtom } from 'jotai';
import { Item, theme } from './theme';

interface ItemWithTransitionSignalProps extends PaperProps {
    transitionAtom: WritableAtom<string | false, string | false>;
}

export const ItemWithTransitionSignal = (props: ItemWithTransitionSignalProps) => {
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
