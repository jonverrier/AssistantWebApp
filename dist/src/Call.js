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
        // Return a promise that will resolve with the complete response
        return new Promise((resolve, reject) => {
            let completeResponse = '';
            let lastProcessedLength = 0;
            const streamWithAxios = async () => {
                try {
                    const response = await (0, axios_1.default)({
                        method: 'POST',
                        url: chatApiUrl,
                        data: chatRequest,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'text/event-stream'
                        },
                        responseType: 'text',
                        timeout: 300000, // 5 minute timeout
                        withCredentials: false,
                        decompress: true,
                        maxRedirects: 5,
                        onDownloadProgress: (progressEvent) => {
                            try {
                                if (!progressEvent.event?.target)
                                    return;
                                const rawData = progressEvent.event.target.response;
                                // Only process new data
                                const newData = rawData.substring(lastProcessedLength);
                                lastProcessedLength = rawData.length;
                                const lines = newData.split('\n');
                                for (const line of lines) {
                                    if (line.trim() && line.startsWith('data: ')) {
                                        const data = line.slice(6).trim();
                                        if (data === '[DONE]') {
                                            console.log('Stream completed');
                                            continue;
                                        }
                                        if (data) {
                                            try {
                                                const parsed = JSON.parse(data);
                                                console.log('Received chunk:', parsed);
                                                completeResponse += parsed;
                                                if (onChunk) {
                                                    onChunk(parsed);
                                                }
                                            }
                                            catch (e) {
                                                console.error('Error parsing chunk:', e);
                                            }
                                        }
                                    }
                                }
                            }
                            catch (e) {
                                console.error('Error processing chunk:', e);
                                throw e;
                            }
                        }
                    });
                    if (response.status === 200) {
                        updateState(UIStateMachine_1.EApiEvent.kFinishedChat);
                        resolve(completeResponse);
                    }
                    else {
                        throw new Error(`Unexpected status: ${response.status}`);
                    }
                }
                catch (error) {
                    console.error('Streaming error:', error);
                    updateState(UIStateMachine_1.EApiEvent.kError);
                    reject(error);
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
        if (axios_1.default.isAxiosError(error)) {
            console.error('API Error:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
        }
        else {
            console.error('Unexpected error:', error);
        }
        return undefined;
    }
}
