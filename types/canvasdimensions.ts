export interface Dimensions {
    x: number;
    y: number;
}

export const getDimensions = (parentWidth: number): Dimensions => {
    const baseIncrement = Math.max(Math.floor(parentWidth / 32) - 1, 1);
    return { x: baseIncrement * 32, y: baseIncrement * 18 };
};
