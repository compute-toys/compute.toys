// helper to convert from supabase UTC date to standard euro-style year-month-day
export const toDateString = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

export const toUnixTime = (utcDate: string) => {
    const date = new Date(utcDate).getTime();
    return date;
}