/**
 * ChatHistoryCall.ts
 * 
 * Handles API communication for retrieving chat messages with pagination support.
 * Provides functionality for fetching messages through HTTP requests with retry logic.
 */
/*! Copyright Jon Verrier 2025 */

import { 
    IChatMessageRequest,
    IChatMessageResponse,
    IChatMessage,
    IUserSessionSummary
} from 'prompt-repository';

import { ApiClient, createRetryableAxiosClient } from './ApiCallUtils';
import { ConsoleLoggingContext, getLogger } from './LoggingUtilities';
import { ELoggerType } from './LoggingTypes';
import { getConfigStrings } from './ConfigStrings';

// Create logger
const apiLogger = getLogger(new ConsoleLoggingContext(), ELoggerType.kApi);

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

            apiLogger.logInput(`Messages API call to ${messagesApiUrl} with data: ${JSON.stringify(request)}`);
            const response = await apiClient.post<IChatMessageResponse>(
                messagesApiUrl,
                request
            );
            apiLogger.logResponse(`Messages API response data: ${JSON.stringify(response.data)}`);

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
        const config = getConfigStrings();
        apiLogger.logError(`Error retrieving messages: ${error instanceof Error ? error.message : config.unknownError}`);
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
        apiLogger.logInput(`Remove log entry API call to ${removeLogEntryUrl} with data: ${JSON.stringify(query)}`);
        const response = await apiClient.post<IRemoveLogEntryResponse>(
            removeLogEntryUrl,
            query
        );
        apiLogger.logResponse(`Remove log entry response data: ${JSON.stringify(response.data)}`);

        return response.data;
    } catch (error) {
        const config = getConfigStrings();
        apiLogger.logError(`Error removing log entry: ${error instanceof Error ? error.message : config.unknownError}`);
        throw error;
    }
} 