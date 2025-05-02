/**
 * @module AssistantChatApiTypes
 * 
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */

// Copyright (c) 2025 Jon Verrier

/**
 * A response from the assistant chat API.
 * Contains the assistant's response classificataion for screening checks.
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