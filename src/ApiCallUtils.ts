/**
 * ApiClient.ts
 * 
 * Provides a shared Axios client with retry logic for API calls.
 * Used across different API call modules to ensure consistent retry behavior.
 */
/*! Copyright Jon Verrier 2025 */

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { ILoggingContext, getLogger, withLogging } from './LoggingUtilities';
import { ELoggerType } from './LoggingTypes';

export interface ApiClient {
    post: <T>(url: string, data: any, config?: any) => Promise<{ 
        data: T;
        status?: number;
    }>;
}

/**
 * Creates a retryable Axios client with custom configuration.
 * 
 * This function creates an Axios instance with a 30-second timeout, JSON content type,
 * and disables credentials. It also includes retry logic with exponential backoff and jitter.
 * 
 * @param loggingContext Optional logging context for API logging
 * @param loggerType Optional logger type for API logging
 * @returns An Axios instance configured for retryable requests
 */
export function createRetryableAxiosClient(loggingContext?: ILoggingContext, loggerType: ELoggerType = ELoggerType.kApi): ApiClient {
    const client = axios.create({
        timeout: 30000, // 30 second timeout
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: false
    });
    
    axiosRetry(client, { 
        retries: 3,
        retryDelay: (retryCount) => {
            return axiosRetry.exponentialDelay(retryCount) + Math.random() * 1000; // Add jitter
        },
        retryCondition: (error) => {
            return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
                   (error.response?.status ?? 0) >= 500 ||
                   error.code === 'ECONNABORTED' ||
                   error.code === 'ERR_NETWORK';
        },
        shouldResetTimeout: true
    });

    // If logging context is provided, wrap the client with logging
    if (loggingContext) {
        const logger = getLogger(loggingContext, loggerType);
        return withLogging(client, logger);
    }

    return client;
} 