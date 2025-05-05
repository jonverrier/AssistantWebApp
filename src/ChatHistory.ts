/**
 * ChatHistory.ts
 * 
 * Handles API communication for retrieving chat history with pagination support.
 */
/*! Copyright Jon Verrier 2025 */

import axios from 'axios';
import axiosRetry from 'axios-retry';

import { 
    IChatMessageRequest,
    IChatMessageResponse,
    IChatMessage
} from '../import/AssistantChatApiTypes';
import { EApiEvent } from './UIStateMachine';

interface ApiClient {
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
 * @returns An Axios instance configured for retryable requests
 */
function createRetryableAxiosClient(): ApiClient {
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

    return client;
}

/**
 * Options for retrieving chat history.
 */
interface ProcessChatHistoryOptions {
    chatHistoryApiUrl: string;
    sessionId: string;
    limit: number;
    onPage?: (messages: IChatMessage[]) => void;
    updateState?: (event: EApiEvent) => void;
    apiClient?: ApiClient;
}

/**
 * Retrieves all chat messages for a session with pagination support.
 * 
 * This function fetches messages in pages using the continuation token,
 * calling the onPage callback for each page of messages received.
 * 
 * @param options - The options for retrieving messages
 * @returns A promise that resolves with all retrieved messages
 */
export async function processChatHistory({
    chatHistoryApiUrl,
    sessionId,
    limit,
    onPage,
    apiClient
}: ProcessChatHistoryOptions): Promise<IChatMessage[] | undefined> {
    if (!apiClient) {
        apiClient = createRetryableAxiosClient();
    }

    const allMessages: IChatMessage[] = [];
    let continuation: string | undefined;

    try {

        do {
            const request: IChatMessageRequest = {
                sessionId,
                limit,
                continuation
            };

            const response = await apiClient.post<IChatMessageResponse>(
                chatHistoryApiUrl,
                request
            );

            const { messages, continuation: nextContinuation } = response.data;

            // Add messages to our collection
            allMessages.push(...messages);

            // Call the onPage callback if provided
            if (onPage) {
                onPage(messages);
            }

            // Update continuation for next iteration
            continuation = nextContinuation;

        } while (continuation);

        return allMessages;

    } catch (error) {
        console.error('Error retrieving chat history:', error);
        return undefined;
    }
} 