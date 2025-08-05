/**
 * Common utility functions for MFE Toolkit
 */
/**
 * Generates a unique ID using timestamp and random string
 * @returns A unique identifier string
 */
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
/**
 * Creates a promise that resolves after a specified delay
 * @param ms - The delay in milliseconds
 * @returns A promise that resolves after the delay
 */
export const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
/**
 * Safely parses JSON with error handling
 * @param json - The JSON string to parse
 * @param fallback - The fallback value if parsing fails
 * @returns The parsed object or the fallback value
 */
export const safeJsonParse = (json, fallback) => {
    try {
        return JSON.parse(json);
    }
    catch {
        return fallback;
    }
};
/**
 * Deep clones an object using JSON serialization
 * Note: This method has limitations with functions, undefined, symbols, and dates
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
/**
 * Debounces a function call
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced function
 */
export const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};
/**
 * Throttles a function call
 * @param fn - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns The throttled function
 */
export const throttle = (fn, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};
