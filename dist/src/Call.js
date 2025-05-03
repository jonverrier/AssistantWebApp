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
 * Creates a retryable Axios client with custom configuration.
 *
 * This function creates an Axios instance with a 30-second timeout, JSON content type,
 * and disables credentials. It also includes retry logic with exponential backoff and jitter.
 *
 * @returns An Axios instance configured for retryable requests
 */
function createRetryableAxiosClient() {
    const client = axios_1.default.create({
        timeout: 30000, // 30 second timeout
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: false
    });
    (0, axios_retry_1.default)(client, {
        retries: 3,
        retryDelay: (retryCount) => {
            return axios_retry_1.default.exponentialDelay(retryCount) + Math.random() * 1000; // Add jitter
        },
        retryCondition: (error) => {
            return axios_retry_1.default.isNetworkOrIdempotentRequestError(error) ||
                (error.response?.status ?? 0) >= 500 ||
                error.code === 'ECONNABORTED' ||
                error.code === 'ERR_NETWORK';
        },
        shouldResetTimeout: true
    });
    return client;
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
async function processChat({ screeningApiUrl, chatApiUrl, input, sessionId, personality, updateState, apiClient, benefitOfDoubt, onChunk, forceNode }) {
    if (!apiClient) {
        apiClient = createRetryableAxiosClient();
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
        const screeningResponse = await apiClient.post(screeningApiUrl, chatRequest);
        const screeningResult = screeningResponse.data;
        if (!screeningResult || screeningResult.type === AssistantChatApiTypes_1.EScreeningClassification.kOffTopic) {
            updateState(UIStateMachine_1.EApiEvent.kRejectedFromScreening);
            return undefined;
        }
        updateState(UIStateMachine_1.EApiEvent.kPassedScreening);
        updateState(UIStateMachine_1.EApiEvent.kStartedChat);
        // Return a promise that will resolve with the complete response
        return new Promise((resolve, reject) => {
            let completeResponse = '';
            let lastProcessedLength = 0;
            const streamWithAxios = async () => {
                try {
                    const config = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'text/event-stream'
                        },
                        timeout: 300000, // 5 minute timeout
                        withCredentials: false,
                        decompress: true,
                        maxRedirects: 5,
                    };
                    if (forceNode) {
                        // Node.js environment: use response streaming
                        config.responseType = 'stream';
                        const response = await apiClient.post(chatApiUrl, chatRequest, config);
                        const stream = response.data;
                        stream.on('data', (chunk) => {
                            const chunkStr = chunk.toString();
                            processStreamData(chunkStr);
                        });
                        stream.on('end', () => {
                            updateState(UIStateMachine_1.EApiEvent.kFinishedChat);
                            resolve(completeResponse);
                        });
                        stream.on('error', (error) => {
                            console.error('Stream error:', error);
                            updateState(UIStateMachine_1.EApiEvent.kError);
                            reject(error);
                        });
                    }
                    else {
                        // Browser environment: use XHR streaming
                        config.responseType = 'text';
                        config.onDownloadProgress = (progressEvent) => {
                            try {
                                if (!progressEvent.event?.target)
                                    return;
                                const rawData = progressEvent.event.target.response;
                                // Only process new data
                                const newData = rawData.substring(lastProcessedLength);
                                lastProcessedLength = rawData.length;
                                processStreamData(newData);
                            }
                            catch (e) {
                                console.error('Error in onDownloadProgress:', e);
                                throw e;
                            }
                        };
                        const response = await apiClient.post(chatApiUrl, chatRequest, config);
                        if (response.status === 200) {
                            updateState(UIStateMachine_1.EApiEvent.kFinishedChat);
                            resolve(completeResponse);
                        }
                        else {
                            throw new Error(`Unexpected status: ${response.status}`);
                        }
                    }
                }
                catch (error) {
                    console.error('Streaming error:', error);
                    updateState(UIStateMachine_1.EApiEvent.kError);
                    reject(error);
                }
            };
            // Helper function to process stream data chunks
            const processStreamData = (data) => {
                const lines = data.split('\n');
                for (const line of lines) {
                    if (line.trim() && line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]')
                            continue;
                        if (data) {
                            const parsed = JSON.parse(data);
                            completeResponse += parsed;
                            if (onChunk) {
                                onChunk(parsed);
                            }
                        }
                    }
                }
            };
            streamWithAxios();
            const timeout = setTimeout(() => {
                updateState(UIStateMachine_1.EApiEvent.kError);
                reject(new Error('Connection timed out'));
            }, 300000); // 5 minute timeout
        });
    }
    catch (error) {
        updateState(UIStateMachine_1.EApiEvent.kError);
        return undefined;
    }
}
