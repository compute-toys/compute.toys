import { createContext, useContext, useState } from 'react';

interface WindowManagementContextInterface {
    clear: (uuid: string) => void;
    add: (uuid: string) => void;
    moveToTop: (uuid: string) => void;
    uuidOrder: string[];
}

const WindowManagementContext = createContext<WindowManagementContextInterface>(undefined);

export const WindowManagementProvider = ({ ...props }) => {
    const [uuids, setUuids] = useState<string[]>([]);

    const clear = async (uuid: string) => {
        setUuids(uuids.filter(handle => handle !== uuid));
    };

    const add = (uuid: string) => {
        setUuids(previous => {
            const uuidsCp = [...previous];
            const idx = uuidsCp.indexOf(uuid);
            if (idx < 0) {
                return [uuid, ...uuidsCp];
            }
            return [...uuidsCp];
        });
    };

    const moveToTop = (uuid: string) => {
        setUuids(previous => {
            const uuidsCp = [...previous];
            const currentIndex = uuidsCp.indexOf(uuid);
            if (currentIndex >= 0) {
                uuidsCp.splice(uuidsCp.indexOf(uuid), 1);
            }
            return [uuid, ...uuidsCp];
        });
    };

    return (
        <WindowManagementContext.Provider
            value={{
                clear,
                add,
                moveToTop,
                uuidOrder: uuids
            }}
            {...props}
        />
    );
};

export const useWindowManagement = () => {
    const context = useContext(WindowManagementContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
