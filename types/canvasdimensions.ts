interface Dimensions {
    x: number;
    y: number;
}

export const getDimensions = (parentWidth: number): Dimensions => {
    const baseIncrement = Math.max(parentWidth / 32, 1);
    return { x: baseIncrement * 32, y: baseIncrement * 18 };
};
