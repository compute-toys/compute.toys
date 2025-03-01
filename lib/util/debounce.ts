/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return function(...args: Parameters<T>): void {
        const later = () => {
            timeout = null;
            func(...args);
        };
        
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        
        timeout = setTimeout(later, wait);
    };
} 