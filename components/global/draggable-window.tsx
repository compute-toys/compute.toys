import DisabledByDefaultSharp from '@mui/icons-material/DisabledByDefaultSharp';
import { SxProps, Theme } from '@mui/material/styles';
import {
    Dispatch,
    Fragment,
    ReactNode,
    SetStateAction,
    useEffect,
    useId,
    useRef,
    useState
} from 'react';
import Draggable from 'react-draggable';
import { v4 as UUID } from 'uuid';
import { useWindowManagement } from '../../lib/util/draggablewindowscontext';
import { Item } from '../../theme/theme';

interface DraggableWindowProps {
    children: ReactNode;
    hidden: boolean;
    setHidden: Dispatch<SetStateAction<boolean>>;
    /**
     * Optional styles to be applied to the <Item> content container
     */
    sx?: SxProps<Theme>;
}

// the z-index at which windows should start at,
// so the window at the back will have a z-index of 2,
// the window in front of it 3, etc.
const BASE_Z_INDEX = 2;

export default function DraggableWindow({ children, hidden, setHidden, sx }: DraggableWindowProps) {
    const [zIndex, setZIndex] = useState(BASE_Z_INDEX);

    // unique ID used for z-index placement relative to other windows
    const [uuid] = useState(UUID());

    // Draggable needs this so React doesn't complain
    // about violating strict mode DOM access rules
    const nodeRef = useRef(null);

    // used for handle grab ID
    const handleId = useId();
    // useIds IDs include colons, which need escaping to be used with selectors
    const handleSelector = `#${CSS.escape(handleId)}`;

    const { clear, add, moveToTop, uuidOrder } = useWindowManagement();

    // set initial uuid, clear when done
    useEffect(() => {
        add(uuid);

        return () => {
            clear(uuid);
        };
    }, []);

    // if uuid order change happens, change the zIndex
    // using JSON.stringify for useEffect on array, I suppose
    // it's not too bad of a pattern
    useEffect(() => {
        const idx = uuidOrder.indexOf(uuid);
        if (idx < 0) return;
        setZIndex(BASE_Z_INDEX + uuidOrder.length - 1 - idx);
    }, [JSON.stringify(uuidOrder)]);

    // move to top upon being unhidden
    useEffect(() => {
        if (!hidden) {
            moveToTop(uuid);
        }
    }, [hidden]);

    return (
        <Fragment>
            <Draggable
                onMouseDown={() => moveToTop(uuid)}
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
                                  zIndex: zIndex,
                                  display: 'inline-block',
                                  position: 'fixed',
                                  left: '12%',
                                  top: '12%'
                              },
                        ...(Array.isArray(sx) ? sx : [sx])
                    ]}
                >
                    {zIndex}
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <div
                            id={handleId}
                            style={{
                                flex: 1,
                                backgroundImage:
                                    'repeating-linear-gradient(-45deg, rgba(255,255,255, 0.25), rgba(255,255,255, 0.25) 2px, transparent 1px, transparent 6px)',
                                backgroundSize: '4px 4px'
                            }}
                        ></div>
                        {/* Annoying viewbox tweak to align with drag bar*/}
                        <DisabledByDefaultSharp
                            role="button"
                            viewBox="1.5 1.5 19.5 20"
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
