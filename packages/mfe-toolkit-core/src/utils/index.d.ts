/**
 * Common utility functions for MFE Toolkit
 */
/**
 * Generates a unique ID using timestamp and random string
 * @returns A unique identifier string
 */
export declare const generateId: () => string;
/**
 * Creates a promise that resolves after a specified delay
 * @param ms - The delay in milliseconds
 * @returns A promise that resolves after the delay
 */
export declare const delay: (ms: number) => Promise<void>;
/**
 * Safely parses JSON with error handling
 * @param json - The JSON string to parse
 * @param fallback - The fallback value if parsing fails
 * @returns The parsed object or the fallback value
 */
export declare const safeJsonParse: <T = any>(json: string, fallback: T) => T;
/**
 * Deep clones an object using JSON serialization
 * Note: This method has limitations with functions, undefined, symbols, and dates
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
export declare const deepClone: <T>(obj: T) => T;
/**
 * Debounces a function call
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced function
 */
export declare const debounce: <T extends (...args: any[]) => any>(fn: T, delay: number) => ((...args: Parameters<T>) => void);
/**
 * Throttles a function call
 * @param fn - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns The throttled function
 */
export declare const throttle: <T extends (...args: any[]) => any>(fn: T, limit: number) => ((...args: Parameters<T>) => void);
//# sourceMappingURL=index.d.ts.map