/**
 * ArchiveCall.ts
 * 
 * Handles archiving functionality for chat messages. Provides functions to determine
 * when archiving is needed and to perform the archiving operation.
 */
/*! Copyright Jon Verrier 2025 */

import { IChatMessage, 
   IArchiveMessageRequest, 
   IArchiveMessageResponse, 
   renderChatMessageAsText } from 'prompt-repository';
import { encode } from 'gpt-tokenizer';
import { ApiClient, createRetryableAxiosClient } from './ChatCallUtils';

// Constants for archive settings
const kMaxMessagesBeforeArchive = 100;  // Maximum number of messages before suggesting archive
const kArchivePageSize = 50;
const kTokenThreshold = (14*1024);

/**
 * Options for archiving chat messages
 */
interface ArchiveOptions {
    archiveApiUrl: string;
    sessionId: string;
    messages: IChatMessage[];
    apiClient?: ApiClient;
}

/**
 * Determines if the chat history should be archived based on:
 * 1. Number of messages (if exceeds kMaxMessagesBeforeArchive)
 * 2. Total token length of all messages (if exceeds kTokenThreshold)
 * 
 * @param messages Array of chat messages to check
 * @returns boolean indicating if archiving is recommended
 */
export function shouldArchive(messages: IChatMessage[]): boolean {
    if (messages.length === 0) return false;

    // Check if number of messages exceeds limit
    if (messages.length > kMaxMessagesBeforeArchive) {
        return true;
    }

    // Calculate total token length of all messages using GPT tokenizer
    const totalTokens = messages.reduce((acc, message) => {
        const formattedMessage = renderChatMessageAsText(message);
        const tokens = encode(formattedMessage);
        return acc + tokens.length;
    }, 0);

    // Check if total tokens exceed threshold
    if (totalTokens > kTokenThreshold) {
        return true;
    }

    return false;
}

/**
 * Archives chat messages by:
 * 1. Calculating key timestamps (first message and mid-point)
 * 2. Calling the archive API to archive older messages, handling pagination
 * 3. Returning the remaining active messages
 * 
 * @param options - The options for archiving messages
 * @returns Promise that resolves with remaining messages after archiving
 */
export async function archive({
    archiveApiUrl,
    sessionId,
    messages,
    apiClient
}: ArchiveOptions): Promise<IChatMessage[]> {
    if (messages.length === 0) return messages;

    if (!apiClient) {
        apiClient = createRetryableAxiosClient();
    }

    // Calculate key timestamps
    const firstMessageTime = new Date(messages[0].timestamp).toISOString();
    const midPointIndex = Math.floor(messages.length / 2);
    const midPointTime = new Date(messages[midPointIndex].timestamp).toISOString();

    try {
        let totalArchived = 0;
        let continuation: string | undefined;

        // Process all pages of messages to archive
        do {
            // Prepare the archive request
            const archiveRequest: IArchiveMessageRequest = {
                sessionId,
                createdAfter: firstMessageTime,
                createdBefore: midPointTime,
                limit: kArchivePageSize,
                continuation
            };

            // Call the archive API
            const response = await apiClient.post<IArchiveMessageResponse>(
                archiveApiUrl,
                archiveRequest
            );

            // Update total archived count and continuation token
            if (response.data.updatedCount) {
                totalArchived += response.data.updatedCount;
            }
            continuation = response.data.continuation;

        } while (continuation);

        if (totalArchived === 0) {
            throw new Error('Archive operation failed - no messages were archived');
        }

        // Keep messages from the midpoint onwards
        const recentMessages = messages.slice(midPointIndex);
        return recentMessages;

    } catch (error) {
        console.error('Error archiving messages:', error);
        throw error;
    }
} 