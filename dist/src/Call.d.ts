/**
 * Call.ts
 *
 * Handles API communication with the assistant chat service. Provides functionality
 * for processing chat input through HTTP requests, with retry logic and state management.
 */
/*! Copyright Jon Verrier 2025 */
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';
import { EApiEvent } from './UIStateMachine';
interface ApiClient {
    post: <T>(url: string, data: any, config?: any) => Promise<{
        data: T;
    }>;
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
 * Processes chat input through the assistant service.
 *
 * This function first calls the screening API to classify the input, then if approved,
 * proceeds to call the main chat API. Includes retry logic for failed requests and
 * state management for UI updates. The chat API response is streamed as text chunks.
 *
 * @param options - The options for processing the chat input.
 * @returns The complete assistant's response string if successful, or undefined if there's an error.
 */
export declare function processChat({ screeningApiUrl, chatApiUrl, input, sessionId, personality, updateState, apiClient, benefitOfDoubt, onChunk }: ProcessChat): Promise<string | undefined>;
export {};
//# sourceMappingURL=Call.d.ts.map