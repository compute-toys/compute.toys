interface Dimensions {
    x: number;
    y: number;
}

export const getDimensions = (parentWidth: number, embed: boolean): Dimensions => {
    let d = embed ? parentWidth / 32 : Math.floor(parentWidth / 32);
    const baseIncrement = Math.max(d);
    return { x: baseIncrement * 32, y: baseIncrement * 18 };
};
