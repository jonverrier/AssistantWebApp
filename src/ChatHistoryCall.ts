/**
 * ChatHistoryCall.ts
 * 
 * Handles API communication for retrieving chat messages with pagination support.
 * Provides functionality for fetching messages through HTTP requests with retry logic.
 */
/*! Copyright Jon Verrier 2025 */

import axios from 'axios';
import axiosRetry from 'axios-retry';

import { 
    IChatMessageRequest,
    IChatMessageResponse,
    IChatMessage
} from 'prompt-repository';

import { ApiClient, createRetryableAxiosClient } from './ChatCallUtils';

/**
 * Options for retrieving chat messages.
 */
interface processChatHistoryOptions {
    messagesApiUrl: string;
    sessionId: string;
    limit: number;
    onPage?: (messages: IChatMessage[]) => void;
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
    messagesApiUrl,
    sessionId,
    limit,
    onPage,
    apiClient
}: processChatHistoryOptions): Promise<IChatMessage[]> {
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
                messagesApiUrl,
                request
            );

            const { records, continuation: nextContinuation } = response.data;

            // Add messages to our collection
            allMessages.push(...records);

            // Call the onPage callback if provided
            if (onPage) {
                onPage(records);
            }

            // Update continuation for next iteration
            continuation = nextContinuation;

        } while (continuation);

        return allMessages;

    } catch (error) {
        console.error('Error retrieving messages:', error);
        throw error;
    }
} 