/**
 * @module AssistantChatApiTypes
 *
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */
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
 */
export interface IAssistantChatRequest {
    personality: EAssistantPersonality;
    sessionId: string;
    input: string;
    benefitOfDoubt?: boolean;
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