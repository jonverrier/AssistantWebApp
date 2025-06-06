/**
 * @module AssistantChatApiTypes
 * 
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */
// Copyright (c) 2025 Jon Verrier


import { IUserSessionSummary, IChatMessage, EModelProvider } from "prompt-repository";

/**
 * An enumeration of possible assistant personalities.
 * Used to specify the desired personality type for chat interactions.
 */
export enum EAssistantPersonality {
   kTheYardAssistant = 'TheYardAssistant',
   kCrankAssistant = 'CrankAssistant',   
   kDemoAssistant = 'DemoAssistant'
}

/**
 * An enumeration of possible user roles.
 * Used to specify the role of the user within a facility
 */
export enum EUserRole {
   kArchived = 'archived',
   kGuest = 'guest',
   kMember = 'member',
   kAdmin = 'admin'
}

/**
 * An enumeration of possible login providers.
 * Used to specify the provider of the user's login credentials
 */
export enum ELoginProvider {
   kGoogle = 'google'
}

/**
 * An enumeration of possible interstitial prompts.
 * Used to specify the prompt for the interstitial prompt when the user logs in e.g. a marketing survey or broadcast message
 */
export enum EShowInterstitialPrompt {
   kNone = 'none',
   kFeedbackSurvey = 'feedbackSurvey',
   kBroadcast = 'broadcast'
}


/**
 * A data structure for user data.
 * Used to specify the user's data for a chat session
 */
export interface IUserDetails {
   email: string;
   userID: string;
   name: string;
   loginProvider: ELoginProvider;
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
 * TODO - remove optionality when clear on way forward with TheYard
 */
export interface ISessionRequest {
   personality?: EAssistantPersonality;
   userDetails?: IUserDetails;
   sessionId?: string;
}

/**
 * Response to a request for a new session.
 */
export interface ISessionResponse {
   sessionId: string;
   role: EUserRole;
   showInterstitialPrompt: EShowInterstitialPrompt;
}

/**
 * A data structure for a user session.
 * Used to specify the user's session data for a chat session. 
 */
export interface IUserSessionDetails {
   sessionId: string;
   userDetails: IUserDetails;
   role: EUserRole;
}

/**
 * A request to the assistant chat API.
 * Use this for one-shot screening of the specific new input
 */
export interface IAssistantSimpleChatRequest {
   personality: EAssistantPersonality;
   sessionSummary: IUserSessionSummary;
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
