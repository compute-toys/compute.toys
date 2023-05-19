interface Position {
    row: number;
    col: number;
}

export type ParseError = {
    summary: string;
    position: Position;
    success: boolean;
};
