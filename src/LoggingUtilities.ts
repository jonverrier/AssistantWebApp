/**
 * LoggingUtilities.ts
 * 
 * Provides logging functionality with configurable contexts and types.
 * Includes sanitization of log messages for security.
 */
/*! Copyright Jon Verrier 2025 */

import { getConfigStrings } from './ConfigStrings';
import { ELoggerType } from './LoggingTypes';

/**
 * Interface for logging context that handles actual logging operations
 */
export interface ILoggingContext {
    log(message: string, details?: any): void;
    info(message: string, details?: any): void;
    warning(message: string, details?: any): void;
    error(message: string, details?: any): void;
}

/**
 * Interface for logger that provides logging with type-based filtering
 */
export interface ILogger {
    logInput(message: string): void;
    logResponse(message: string): void;
    logError(message: string): void;
}

/**
 * Sanitizes a log message by removing sensitive information
 * @param message The message to sanitize
 * @returns Sanitized message string
 */
function sanitizeString(message: string): string {
    if (!message) return 'Unknown error';

    return message
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]') // Replace email addresses
        .replace(/\b\d{16,19}\b/g, '[CARD]') // Replace credit card numbers
        .trim();
}

/**
 * Console implementation of ILoggingContext
 * Useful for development and testing
 */
export class ConsoleLoggingContext implements ILoggingContext {
    public log(message: string, details?: any): void {
        console.log(message, details || '');
    }

    public info(message: string, details?: any): void {
        console.info(message, details || '');
    }

    public warning(message: string, details?: any): void {
        console.warn(message, details || '');
    }

    public error(message: string, details?: any): void {
        console.error(message, details || '');
    }
}

/**
 * Concrete implementation of ILogger
 */
export class Logger implements ILogger {
    private readonly context: ILoggingContext;
    private readonly type: ELoggerType;
    private readonly isEnabled: boolean;

    constructor(context: ILoggingContext, type: ELoggerType) {
        this.context = context;
        this.type = type;
        
        // Check if this logger type is enabled in config
        const config = getConfigStrings();
        this.isEnabled = config.loggingTypes?.includes(type) ?? false;
    }

    public logInput(message: string): void {
        if (!this.isEnabled) return;
        const sanitized = sanitizeString(message);
        this.context.info(`[${this.type}] Input: ${sanitized}`);
    }

    public logResponse(message: string): void {
        if (!this.isEnabled) return;
        const sanitized = sanitizeString(message);
        this.context.info(`[${this.type}] Response: ${sanitized}`);
    }

    public logError(message: string): void {
        const sanitized = sanitizeString(message);
        this.context.error(`[${this.type}] Error: ${sanitized}`);
    }
}

/**
 * Factory function to create a logger instance
 * @param context The logging context to use
 * @param type The type of logger to create
 * @returns An ILogger instance
 */
export function getLogger(context: ILoggingContext, type: ELoggerType): ILogger {
    return new Logger(context, type);
}

/**
 * Type for an axios-like API client
 */
export interface ApiClient {
    post: <T>(url: string, data: any, config?: any) => Promise<{
        data: T;
        status?: number;
    }>;
}

/**
 * Wraps an API client with logging functionality
 * @param apiClient The API client to wrap
 * @param logger The logger to use
 * @returns A wrapped API client that logs requests and responses
 */
export function withLogging(apiClient: ApiClient, logger: ILogger): ApiClient {
    return {
        post: async <T>(url: string, data: any, config?: any) => {
            try {
                // Log the request
                logger.logInput(`POST ${url} ${JSON.stringify(data)}`);

                // Make the request
                const response = await apiClient.post<T>(url, data, config);

                // Log the response
                logger.logResponse(`${url} responded with ${JSON.stringify(response.data)}`);

                return response;
            } catch (error) {
                // Log any errors
                logger.logError(error instanceof Error ? error.message : 'Unknown error occurred');
                throw error;
            }
        }
    };
} 