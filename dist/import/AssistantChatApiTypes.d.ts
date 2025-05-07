/**
 * @module AssistantChatApiTypes
 *
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */
import { IChatMessage } from "prompt-repository";
/**
 * A request for a new session, optionally populated with the existing session ID.
 */
export interface ISessionRequest {
    sessionId?: string;
}
/**
 * Response to a request for a new session.
 */
export interface ISessionResponse {
    sessionId: string;
}
/**
 * An enumeration of possible assistant personalities.
 * Used to specify the desired personality type for chat interactions.
 */
export declare enum EAssistantPersonality {
    kMastersAdviser = "MastersAdviser"
}
/**
 * A request to the assistant chat API.
 * Use this for one-shot screening of the specific new input
 */
export interface IAssistantSimpleChatRequest {
    personality: EAssistantPersonality;
    sessionId: string;
    input: string;
    benefitOfDoubt?: boolean;
}
/**
 * A request to the assistant chat API including hostory.
 * Use this for full chat sessions including prior context
 */
export interface IAssistantFullChatRequest extends IAssistantSimpleChatRequest {
    history: IChatMessage[];
}
/**
 * A response from the assistant chat API.
 * Contains the assistant's response classificataion for screening checks.
 */
export declare enum EScreeningClassification {
    kGreeting = "greeting",
    kOnTopic = "onTopic",
    kOffTopic = "offTopic"
}
/**
 * A response from the screening classification API.
 */
export interface IScreeningClassificationResponse {
    type: EScreeningClassification;
}
//# sourceMappingURL=AssistantChatApiTypes.d.ts.map