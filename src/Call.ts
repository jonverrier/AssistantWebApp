/**
 * Call.ts
 * 
 * Handles API communication with the assistant chat service. Provides functionality
 * for processing chat input through HTTP requests, with retry logic and state management.
 */
/*! Copyright Jon Verrier 2025 */

import axios, { AxiosProgressEvent } from 'axios';
import axiosRetry from 'axios-retry';

import { IAssistantChatRequest, 
   IScreeningClassificationResponse,
   EAssistantPersonality,
   EScreeningClassification } from '../import/AssistantChatApiTypes';
import { EApiEvent } from './UIStateMachine';

interface ApiClient {
    post: <T>(url: string, data: any, config?: any) => Promise<{ data: T }>;
}

/**
 * Options for the screening API call.
 */
interface ScreeningOptions {
    apiUrl: string;
    request: IAssistantChatRequest;
    apiClient?: ApiClient;
}

/**
 * Options for processing chat input through the assistant service.
 * 
 * This interface defines the parameters required for processing chat input
 * through the assistant service. It includes the URL for the API endpoint,
 * the input text to process, a session ID for tracking, and a callback 
 * function to update the UI state.
 */
interface ProcessChat {
    screeningApiUrl: string;
    chatApiUrl: string;
    input: string;
    sessionId: string;
    personality: EAssistantPersonality;
    updateState: (event: EApiEvent) => void;
    apiClient?: ApiClient;
    benefitOfDoubt?: boolean;
    onChunk?: (chunk: string) => void;
}

/**
 * Calls the screening API to classify the input.
 * 
 * @param options - The options for the screening API call
 * @returns The screening classification response if successful, or undefined if there's an error
 */
async function callScreeningApi({
   apiUrl,
   request,
   apiClient
}: ScreeningOptions): Promise<IScreeningClassificationResponse | undefined> {

   if (!apiClient) {
      const client = axios.create();
      axiosRetry(client, {
         retries: 3,
         retryDelay: axiosRetry.exponentialDelay,
         retryCondition: (error) => {
            return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response?.status ?? 0) >= 500;
         }
      });
      apiClient = client;
   }

   const response = await apiClient.post<IScreeningClassificationResponse>(
      apiUrl,
      request
   );

   return response.data;
}

/**
 * Processes chat input through the assistant service.
 * 
 * This function first calls the screening API to classify the input, then if approved,
 * proceeds to call the main chat API. Includes retry logic for failed requests and 
 * state management for UI updates. The chat API response is streamed as text chunks.
 * 
 * @param options - The options for processing the chat input.
 * @returns The complete assistant's response string if successful, or undefined if there's an error.
 */
export async function processChat({
    screeningApiUrl,
    chatApiUrl,
    input,
    sessionId,
    personality,
    updateState,
    apiClient,
    benefitOfDoubt,
    onChunk
}: ProcessChat): Promise<string | undefined> {

    if (!apiClient) {
        const client = axios.create();
        axiosRetry(client, { 
            retries: 3,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
                       (error.response?.status ?? 0) >= 500;
            }
        });
        apiClient = client;
    }
    
    try {
        // Signal start of screening
        updateState(EApiEvent.kStartedScreening);

        const chatRequest: IAssistantChatRequest = {
            personality,
            sessionId,
            input,
            benefitOfDoubt
        };

        // First call the screening API
        const screeningResult = await callScreeningApi({
            apiUrl: screeningApiUrl,
            request: chatRequest,
            apiClient
        });

        if (!screeningResult || screeningResult.type === EScreeningClassification.kOffTopic) {
            updateState(EApiEvent.kRejectedFromScreening);
            return undefined;
        }

        updateState(EApiEvent.kPassedScreening);
        updateState(EApiEvent.kStartedChat);

        // If screening passed, proceed with the chat API call with streaming
        const response = await fetch(chatApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream, application/json',  // Accept both SSE and regular JSON
            },
            body: JSON.stringify(chatRequest)
        });

        if (!response.ok || !response.body) {
            throw new Error('Network response was not ok');
        }

        // Log response headers for debugging
        console.log('Response headers:', {
            contentType: response.headers.get('content-type'),
            transferEncoding: response.headers.get('transfer-encoding'),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let completeResponse = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                console.log('Received chunk:', chunk); // Debug log

                // Try to parse as SSE if it starts with 'data: '
                if (chunk.trim().startsWith('data: ')) {
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            completeResponse += data;
                            if (onChunk) {
                                onChunk(completeResponse);
                            }
                        }
                    }
                } else {
                    // Handle as regular chunked response
                    completeResponse += chunk;
                    if (onChunk) {
                        onChunk(completeResponse);
                    }
                }
            }
        } catch (streamError) {
            console.error('Streaming error:', streamError);
            // If streaming fails, try to get the full response
            completeResponse = await response.text();
            if (onChunk) {
                onChunk(completeResponse);
            }
        }

        // Signal completion of chat
        updateState(EApiEvent.kFinishedChat);

        // Return the complete response
        return completeResponse;

    } catch (error) {
        // Handle any errors that weren't automatically retried or failed after retries
        updateState(EApiEvent.kError);
        
        if (axios.isAxiosError(error)) {
            console.error('API Error:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        
        return undefined;
    }
}