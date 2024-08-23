import DisabledByDefaultSharp from '@mui/icons-material/DisabledByDefaultSharp';
import { Theme } from '@mui/material';
import { SxProps } from '@mui/material/styles';
import { Dispatch, Fragment, ReactNode, SetStateAction, useId, useRef } from 'react';
import Draggable from 'react-draggable';
import { Item } from '../../theme/theme';

interface DraggableWindowProps {
    children: ReactNode;
    hidden: boolean;
    setHidden: Dispatch<SetStateAction<boolean>>;
    sx?: SxProps<Theme>;
}

// TODO: on Explainer, set an EXPLAINER_HEIGHT
export default function DraggableWindow({ children, hidden, setHidden, sx }: DraggableWindowProps) {
    // Draggable needs this so React doesn't complain
    // about violating strict mode DOM access rules
    const nodeRef = useRef(null);

    const handleId = useId();
    // useIds IDs include colons, which need escaping to be used with selectors
    const handleSelector = `#${CSS.escape(handleId)}`;

    return (
        <Fragment>
            <Draggable
                handle={handleSelector}
                nodeRef={nodeRef}
                bounds="body"
                positionOffset={{ x: '0', y: '0' }}
            >
                <Item
                    ref={nodeRef}
                    elevation={12}
                    sx={[
                        hidden
                            ? { display: 'none' }
                            : {
                                  zIndex: '2',
                                  display: 'inline-block',
                                  position: 'fixed',
                                  left: '12%',
                                  top: '12%',
                              },
                        ...(Array.isArray(sx) ? sx : [sx])
                    ]}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'end',
                            backgroundImage:
                                'repeating-linear-gradient(-45deg, rgba(255,255,255, 0.25), rgba(255,255,255, 0.25) 2px, transparent 1px, transparent 6px)',
                            backgroundSize: '4px 4px'
                        }}
                    >
                        {/* Annoying viewbox tweak to align with drag bar*/}
                        <div style={{ width: '100%' }} id={handleId}></div>
                        <DisabledByDefaultSharp
                            viewBox="1.5 1.5 19.5 19.5"
                            onClick={() => setHidden(true)}
                            sx={{ cursor: 'pointer', color: 'rgba(150,150,150,1)' }}
                        />
                    </div>
                    {children}
                </Item>
            </Draggable>
        </Fragment>
    );
}
