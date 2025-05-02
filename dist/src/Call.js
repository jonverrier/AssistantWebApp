"use strict";
/**
 * Call.ts
 *
 * Handles API communication with the assistant chat service. Provides functionality
 * for processing chat input through HTTP requests, with retry logic and state management.
 */
/*! Copyright Jon Verrier 2025 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processChat = processChat;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const AssistantChatApiTypes_1 = require("../import/AssistantChatApiTypes");
const UIStateMachine_1 = require("./UIStateMachine");
/**
 * Calls the screening API to classify the input.
 *
 * @param options - The options for the screening API call
 * @returns The screening classification response if successful, or undefined if there's an error
 */
async function callScreeningApi({ apiUrl, request, apiClient }) {
    if (!apiClient) {
        const client = axios_1.default.create();
        (0, axios_retry_1.default)(client, {
            retries: 3,
            retryDelay: axios_retry_1.default.exponentialDelay,
            retryCondition: (error) => {
                return axios_retry_1.default.isNetworkOrIdempotentRequestError(error) ||
                    (error.response?.status ?? 0) >= 500;
            }
        });
        apiClient = client;
    }
    const response = await apiClient.post(apiUrl, request);
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
async function processChat({ screeningApiUrl, chatApiUrl, input, sessionId, personality, updateState, apiClient, benefitOfDoubt, onChunk }) {
    if (!apiClient) {
        const client = axios_1.default.create();
        (0, axios_retry_1.default)(client, {
            retries: 3,
            retryDelay: axios_retry_1.default.exponentialDelay,
            retryCondition: (error) => {
                return axios_retry_1.default.isNetworkOrIdempotentRequestError(error) ||
                    (error.response?.status ?? 0) >= 500;
            }
        });
        apiClient = client;
    }
    try {
        // Signal start of screening
        updateState(UIStateMachine_1.EApiEvent.kStartedScreening);
        const chatRequest = {
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
        if (!screeningResult || screeningResult.type === AssistantChatApiTypes_1.EScreeningClassification.kOffTopic) {
            updateState(UIStateMachine_1.EApiEvent.kRejectedFromScreening);
            return undefined;
        }
        updateState(UIStateMachine_1.EApiEvent.kPassedScreening);
        updateState(UIStateMachine_1.EApiEvent.kStartedChat);
        // If screening passed, proceed with the chat API call with streaming
        const response = await fetch(chatApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream, application/json', // Accept both SSE and regular JSON
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
                if (done)
                    break;
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
                }
                else {
                    // Handle as regular chunked response
                    completeResponse += chunk;
                    if (onChunk) {
                        onChunk(completeResponse);
                    }
                }
            }
        }
        catch (streamError) {
            console.error('Streaming error:', streamError);
            // If streaming fails, try to get the full response
            completeResponse = await response.text();
            if (onChunk) {
                onChunk(completeResponse);
            }
        }
        // Signal completion of chat
        updateState(UIStateMachine_1.EApiEvent.kFinishedChat);
        // Return the complete response
        return completeResponse;
    }
    catch (error) {
        // Handle any errors that weren't automatically retried or failed after retries
        updateState(UIStateMachine_1.EApiEvent.kError);
        if (axios_1.default.isAxiosError(error)) {
            console.error('API Error:', error.response?.data || error.message);
        }
        else {
            console.error('Unexpected error:', error);
        }
        return undefined;
    }
}
