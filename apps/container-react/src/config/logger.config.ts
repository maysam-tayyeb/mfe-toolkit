/**
 * Logger Configuration
 * 
 * This configuration demonstrates how to override the default logger
 * with a custom implementation (Pino) for enhanced logging capabilities.
 */

/**
 * Whether to use Pino logger instead of the default console logger
 * 
 * Benefits of Pino:
 * - Structured logging with JSON output
 * - Better performance than console.log
 * - Log levels and filtering
 * - Pretty printing in development
 * - Can send logs to remote services in production
 */
export const USE_PINO_LOGGER = process.env.REACT_APP_USE_PINO === 'true' || false;

/**
 * Example: Enable Pino logger by setting environment variable
 * REACT_APP_USE_PINO=true pnpm dev
 * 
 * Or uncomment the line below to always use Pino:
 */
// export const USE_PINO_LOGGER = true;