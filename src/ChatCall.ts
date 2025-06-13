/**
 * ChatCall.ts
 * 
 * Handles API communication with the assistant chat service. Provides functionality
 * for processing chat input through HTTP requests, with retry logic and state management.
 */
/*! Copyright Jon Verrier 2025 */

// 3rd party imports
import { Stream } from 'stream';
import { AxiosProgressEvent } from 'axios';

// External project imports
import { IChatMessage, EChatRole, IUserSessionSummary } from 'prompt-repository';

// Internal project imports
import { IAssistantFullChatRequest, 
   IScreeningClassificationResponse,
   EAssistantPersonality,
   EScreeningClassification } from '../import/AssistantChatApiTypes';
import { EApiEvent } from './UIStateMachine';
import { ApiClient, createRetryableAxiosClient } from './ApiCallUtils';
import { isAppInBrowser } from './LocalStorage';
import { ConsoleLoggingContext, getLogger } from './LoggingUtilities';
import { ELoggerType } from './LoggingTypes';

// Create loggers
const apiLogger = getLogger(new ConsoleLoggingContext(), ELoggerType.kApi);

/**
 * Cleans and logs the chat API response by removing data: prefixes and newlines
 * @param responseData - The raw response data to clean
 * @returns The cleaned response string
 */
function cleanAndLogResponse(responseData: string | Stream): string {
    const cleanResponse = responseData.toString()
        .split('\n')
        .filter((line: string) => line.trim().startsWith('data: '))
        .map((line: string) => line.slice(6).trim())
        .filter((content: string) => content && content !== '[DONE]')
        .join('');
    apiLogger.logResponse(`Chat API response content: ${cleanResponse}`);
    return cleanResponse;
}

// Add new interface for streaming response
interface StreamResponse {
    data: Stream;
    status: number;
}

/**
 * Options for processing chat input through the assistant service.
 * 
 * This interface defines the configuration parameters needed when making
 * API calls to the assistant service, including URLs, input text, session
 * tracking, and state management callbacks.
 */
interface ProcessChat {
    screeningApiUrl: string;
    chatApiUrl: string;
    input: string;
    history: IChatMessage[];  
    sessionSummary: IUserSessionSummary;
    personality: EAssistantPersonality;
    benefitOfDoubt?: boolean;     
    updateState: (event: EApiEvent) => void;
    onChunk: (chunk: string) => void;
    onComplete: () => void;
    apiClient?: ApiClient;        
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
    history,
    sessionSummary,
    personality,
    updateState,
    apiClient,
    benefitOfDoubt,
    onChunk,
    onComplete
}: ProcessChat): Promise<string | undefined> {

   if (!apiClient) {
      apiClient = createRetryableAxiosClient();
   }
    
    try {
        const chatRequest: IAssistantFullChatRequest = {
            personality,
            sessionSummary,
            input,
            benefitOfDoubt,
            history
        };

        // Only make a new call to the screening API if there are no assistant responses in history
        const hasAssistantResponses = history.some(msg => msg.role === EChatRole.kAssistant);
        
        // Signal start of screening
        updateState(EApiEvent.kStartedScreening);        
        
        if (!hasAssistantResponses) {
            // Call the screening API
            apiLogger.logInput(`Screening API call to ${screeningApiUrl} with data: ${JSON.stringify(chatRequest)}`);
            const screeningResponse = await apiClient.post<IScreeningClassificationResponse>(
                screeningApiUrl,
                chatRequest
            );        
            apiLogger.logResponse(`Screening API response data: ${JSON.stringify(screeningResponse.data)}`);
            const screeningResult = screeningResponse.data;
    
            if (!screeningResult || screeningResult.type === EScreeningClassification.kOffTopic) {
                updateState(EApiEvent.kRejectedFromScreening);
                return undefined;
            }
        }

        updateState(EApiEvent.kPassedScreening);        
        updateState(EApiEvent.kStartedChat);

        // Return a promise that will resolve with the complete response
        return new Promise((resolve, reject) => {
            let completeResponse = '';
            let lastProcessedLength = 0;

            const streamWithAxios = async () => {
                try {
                    const config: any = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'text/event-stream'
                        },
                        timeout: 300000, // 5 minute timeout
                        withCredentials: false,
                        decompress: true,
                        maxRedirects: 5,
                    };

                    if (!isAppInBrowser()) {
                        // Node.js environment: use response streaming
                        config.responseType = 'stream';
                        apiLogger.logInput(`Chat API call to ${chatApiUrl} with data: ${JSON.stringify(chatRequest)}`);
                        const response = await apiClient.post<Stream>(chatApiUrl, chatRequest, config) as StreamResponse;
                        cleanAndLogResponse(response.data);
                        const stream = response.data;
                        
                        stream.on('data', (chunk: Buffer) => {
                            const chunkStr = chunk.toString();
                            processStreamData(chunkStr);
                        });

                        stream.on('end', () => {
                            updateState(EApiEvent.kFinishedChat);
                            onComplete();
                            resolve(completeResponse);
                        });

                        stream.on('error', (error: Error) => {
                            apiLogger.logError(`Stream error: ${error.message}`);
                            updateState(EApiEvent.kError);
                            reject(error);
                        });
                    } else {
                        // Browser environment: use XHR streaming
                        config.responseType = 'text';
                        config.onDownloadProgress = (progressEvent: AxiosProgressEvent) => {
                            try {
                                if (!progressEvent.event?.target) return;

                                const rawData = progressEvent.event.target.response;
                                // Only process new data
                                const newData = rawData.substring(lastProcessedLength);
                                lastProcessedLength = rawData.length;

                                processStreamData(newData);
                            } catch (e) {
                                apiLogger.logError(`Error in onDownloadProgress: ${e instanceof Error ? e.message : 'Unknown error'}`);
                                throw e;
                            }
                        };

                        apiLogger.logInput(`Chat API call to ${chatApiUrl} with data: ${JSON.stringify(chatRequest)}`);
                        const response = await apiClient.post(chatApiUrl, chatRequest, config);
                        cleanAndLogResponse(response.data as string);

                        if (response.status === 200) {
                            updateState(EApiEvent.kFinishedChat);
                            onComplete();
                            resolve(completeResponse);
                        } else {
                            throw new Error(`Unexpected status: ${response.status}`);
                        }
                    }

                } catch (error) {
                    apiLogger.logError(`Streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    updateState(EApiEvent.kError);
                    reject(error);
                }
            };

            // Helper function to process stream data chunks
           const processStreamData = (data: string) => {
              const lines = data.split('\n');
              for (const line of lines) {
                 if (line.trim() && line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
                    if (data) {
                       const parsed = JSON.parse(data);
                       completeResponse += parsed;
                       onChunk(parsed);
                    }
                 }
              }
           };

            streamWithAxios();

            // Timeout for the stream
            let isCompleted = false;
            const timeout = setTimeout(() => {
                if (!isCompleted) {
                    updateState(EApiEvent.kError);
                    reject(new Error('Connection timed out'));
                }
            }, 300000); // 5 minute timeout

            // Clear timeout when stream ends
            const originalResolve = resolve;
            resolve = (value) => {
                isCompleted = true;
                clearTimeout(timeout);
                originalResolve(value);
            };

            // Clear timeout on reject too
            const originalReject = reject;
            reject = (error) => {
                isCompleted = true;
                clearTimeout(timeout);
                originalReject(error);
            };
        });

    } catch (error) {
        updateState(EApiEvent.kError);
        apiLogger.logError(`Error in processChat: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return undefined;
    }
}


