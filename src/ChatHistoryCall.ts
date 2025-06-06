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
    IChatMessage,
    IUserSessionSummary
} from 'prompt-repository';

import { ApiClient, createRetryableAxiosClient } from './ChatCallUtils';

/**
 * Options for retrieving chat messages.
 */
interface processChatHistoryOptions {
    messagesApiUrl: string;
    sessionSummary: IUserSessionSummary;
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
    sessionSummary,
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
                sessionSummary,
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

/**
 * Interface for the query to remove a log entry
 */
interface IRemoveLogEntryQuery {
    sessionId: string;
    timestamp: Date;
}

/**
 * Interface for the response from removing a log entry
 */
interface IRemoveLogEntryResponse {
    success: boolean;
}

/**
 * Removes a specific message from the chat history.
 * 
 * @param removeLogEntryUrl - The URL of the RemoveLogEntry API endpoint
 * @param query - The query specifying which message to remove
 * @param apiClient - Optional API client to use for the request
 * @returns A promise that resolves with the response from the server
 */
export async function removeLogEntry({
    removeLogEntryUrl,
    query,
    apiClient
}: {
    removeLogEntryUrl: string;
    query: IRemoveLogEntryQuery;
    apiClient?: ApiClient;
}): Promise<IRemoveLogEntryResponse> {
    if (!apiClient) {
        apiClient = createRetryableAxiosClient();
    }

    try {
        const response = await apiClient.post<IRemoveLogEntryResponse>(
            removeLogEntryUrl,
            query
        );

        return response.data;
    } catch (error) {
        console.error('Error removing log entry:', error);
        throw error;
    }
} 