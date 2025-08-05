export const createLogger = (prefix) => {
    const formatMessage = (level, message) => {
        return `[${new Date().toISOString()}] [${prefix}] [${level}] ${message}`;
    };
    return {
        debug: (message, ...args) => {
            console.debug(formatMessage('DEBUG', message), ...args);
        },
        info: (message, ...args) => {
            console.info(formatMessage('INFO', message), ...args);
        },
        warn: (message, ...args) => {
            console.warn(formatMessage('WARN', message), ...args);
        },
        error: (message, ...args) => {
            console.error(formatMessage('ERROR', message), ...args);
        },
    };
};
