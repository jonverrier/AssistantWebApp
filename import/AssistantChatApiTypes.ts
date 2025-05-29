/**
 * @module AssistantChatApiTypes
 * 
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */
// Copyright (c) 2025 Jon Verrier


import { IChatMessage, EModelProvider } from "prompt-repository";

/**
 * An enumeration of possible assistant personalities.
 * Used to specify the desired personality type for chat interactions.
 */
export enum EAssistantPersonality {
   kTheYardAssistant = 'TheYardAssistant',
   kDemoAssistant = 'DemoAssistant'
}

/**
 * An enumeration of possible user roles.
 * Used to specify the role of the user within a facility
 */
export enum EUserRole {
   kOnboarding = 'onboarding',
   kMember = 'member',
   kAdmin = 'admin'
}

/**
 * A request to the assistant captcha API.
 */
export interface IAssistantCaptchaRequest {
   token: string;
   action: string;
}

/**
 * A response from the assistant captcha API.
 */
export interface IAssistantCaptchaResponse {
   isValid: boolean;
   passedThreshold: boolean;
   score: number;
}

/**
 * A request for a new session, optionally populated with the existing session ID.
 */
export interface ISessionRequest {
   email?: string;
   sessionId?: string;
}

/**
 * Response to a request for a new session.
 */
export interface ISessionResponse {
   sessionId: string;
   role: EUserRole;
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
   personality: EAssistantPersonality;
   history: IChatMessage[];
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
 * A request to summarise an message.
 */
export interface ISummariseMessageRequest {
   modelProvider: EModelProvider;
   sessionId: string;
   messages: IChatMessage[];
   wordCount: number;
}

/**
 * A response from the summarise message API.
 */
export interface ISummariseMessageResponse {
   summary: IChatMessage;
};
