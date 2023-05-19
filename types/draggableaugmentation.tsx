/*
    This is a hack to fix a type bug in react-draggable.
    Draggable needs 'children' in its props, which is added here.
    TODO: No issue reference, should be reported.
*/

import { ReactNode } from 'react';
import {
    ControlPosition,
    DraggableBounds,
    DraggableCoreProps,
    PositionOffsetControlPosition
} from 'react-draggable';

declare module 'react-draggable' {
    export interface DraggableProps extends DraggableCoreProps {
        axis: 'both' | 'x' | 'y' | 'none';
        bounds: DraggableBounds | string | false;
        defaultClassName: string;
        defaultClassNameDragging: string;
        defaultClassNameDragged: string;
        defaultPosition: ControlPosition;
        positionOffset: PositionOffsetControlPosition;
        position: ControlPosition;
        children: ReactNode;
    }
}
