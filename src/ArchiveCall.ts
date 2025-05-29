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
   renderChatMessageAsText,
   EChatRole, 
   EModelProvider} from 'prompt-repository';
import { ISummariseMessageRequest,
   ISummariseMessageResponse } from '../import/AssistantChatApiTypes';
import { encode } from 'gpt-tokenizer';
import { ApiClient, createRetryableAxiosClient } from './ChatCallUtils';
import { EApiEvent } from './UIStateMachine';

// Constants for archive settings
const kMaxMessagesBeforeArchive = 100; // 100;  // Maximum number of messages before suggesting archive
const kArchivePageSize = 50;
const kTokenThreshold = (14*1024);

/**
 * Options for archiving chat messages
 */
interface ArchiveOptions {
    apiClient?: ApiClient;   
    archiveApiUrl: string;
    summarizeApiUrl: string;    
    sessionId: string;
    messages: IChatMessage[];
    wordCount: number;    
    updateState: (event: EApiEvent) => void;
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
 * 2. Generating a summary of the messages to archive
 * 3. Calling the archive API to archive older messages, handling pagination
 * 4. Returning the remaining active messages with the summary
 * 
 * @param options - The options for archiving messages including API endpoints, session ID, messages and word count
 * @returns Promise that resolves with remaining messages after archiving, including the generated summary. 
 * If there is an error, we return the old set of messages.
 */
export async function archive({
    archiveApiUrl,
    summarizeApiUrl,
    sessionId,
    messages,
    wordCount,
    apiClient,
    updateState
}: ArchiveOptions): Promise<IChatMessage[]> {
    if (messages.length === 0) return messages;

    if (!apiClient) {
        apiClient = createRetryableAxiosClient();
    }

    let newSummaryMessage : IChatMessage | undefined = undefined;

    updateState(EApiEvent.kStartedArchiving);

    // Calculate key timestamps
    const firstMessageTime = new Date(new Date(messages[0].timestamp).getTime() - 1).toISOString();
    
    // Calculate midpoint and ensure it lands on a user message
    let midPointIndex = Math.ceil(messages.length / 2) + (Math.ceil(messages.length / 2) % 2);
    // Advance to next user message if current message is not from user
    while (midPointIndex < messages.length && messages[midPointIndex].role !== EChatRole.kUser) {
        midPointIndex++;
    }
    // If we couldn't find a user message after midpoint, go backwards to find the last user message before midpoint
    if (midPointIndex >= messages.length) {
        midPointIndex = Math.ceil(messages.length / 2);
        while (midPointIndex > 0 && messages[midPointIndex].role !== EChatRole.kUser) {
            midPointIndex--;
        }
    }
    const midPointTime = new Date(messages[midPointIndex].timestamp).toISOString();

    // Keep messages from the midpoint onwards
    const recentMessages = messages.slice(midPointIndex);
    // Get the older messages that will be archived
    const olderMessages = messages.slice(0, midPointIndex);

    try {
        // Prepare the summarize request
        const summarizeRequest: ISummariseMessageRequest = {
            modelProvider: EModelProvider.kAzureOpenAI,
            sessionId,
            messages: olderMessages,  // Summarize the older messages instead of recent ones
            wordCount
        };

        // Call the summarize API
        const response = await apiClient.post<ISummariseMessageResponse>(
            summarizeApiUrl,
            summarizeRequest
        );

        newSummaryMessage = response.data.summary;

    } catch (error) {
        console.error('Error summarizing messages:', error);
        updateState(EApiEvent.kError);
        return messages;
    }
    
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

        if (newSummaryMessage) {
            recentMessages.unshift(newSummaryMessage);
        }

        updateState(EApiEvent.kFinishedArchiving);        
        return recentMessages;

    } catch (error) {
        console.error('Error archiving messages:', error);
        updateState(EApiEvent.kError);
        return messages;
    }
}
