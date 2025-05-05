/**
 * @module AssistantChatApiTypes
 * 
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */

// Copyright (c) 2025 Jon Verrier

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
export enum EAssistantPersonality {
   kMastersAdviser = 'MastersAdviser'
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
export enum EScreeningClassification {
   kGreeting = 'greeting',
   kOnTopic = 'onTopic',
   kOffTopic = 'offTopic'
}

/**
 * A response from the screening classification API.
 */
export interface IScreeningClassificationResponse {
   type: EScreeningClassification;
}

/**
 * An enumeration of possible chat roles.
 * Used to identify the sender of a message in chat interactions.
 */
export enum EChatRole {
   kUser = 'user',
   kAssistant = 'assistant'
}

/**
 * A message in a chat interaction.
 */
export interface IChatMessage {
   role: EChatRole;
   content: string;
   timestamp: Date;
}

/**
 * A request to the chat API.
 */
export interface IChatMessageRequest {
   sessionId: string;
   limit: number;
   continuation?: string | undefined;
}

/**
 * A response from the chat API.
 */
export interface IChatMessageResponse {
   messages: IChatMessage[];
   continuation?: string | undefined;
}

