/**
 * UIStrings.ts
 * 
 * Defines UI strings used throughout the application. Centralizes all text content
 * for easy localization and maintenance. 
 */
/*! Copyright Jon Verrier 2025 */

import { EAssistantPersonality } from '../import/AssistantChatApiTypes';

export { EMultilineEditUIStrings } from './MultilineEditUIStrings';

/**
 * Replaces a parameter placeholder in a string with a value.
 * @param template The string template containing {x} placeholders where x is a number
 * @param parameter The value to replace the placeholder with
 * @param index The index of the parameter to replace (defaults to 0)
 * @returns The string with the placeholder replaced
 */
export function replaceStringParameter(template: string, parameter: string | number, index: number = 0): string {
    return template.replace(`{${index}}`, parameter.toString());
}

// Common strings used across all linters
export interface ICommonUIStrings {
   kWarning: string;
   kInfo: string;
   kError: string;
   kSuccess: string;
   kServerErrorDescription: string;
   kHomeTitle: string;
   kPrivacyTitle: string;
   kTermsTitle: string;
   kHome: string,
   kChat: string;   
   kPrivacy: string;
   kTerms: string;
   kAIWarning: string;
   kArchivingPleaseWait: string;
   kArchivingDescription: string;
   kProcessingPleaseWait: string;
   kLoginBlocked: string;
   kAdditionalVerification: string;
   kTooManyAttempts: string;
   kLoginFailed: string;
   kLogoutFailed: string;
}

// Strings that vary between different white labelled implementations
export interface IBrandUIStrings {
   kAppPageCaption: string;
   kAppPageStrapline: string;
   kOverview: string;
   kLinks: string;
   kChatPreamble: string;
   kChatPlaceholder: string;
   kLooksOffTopic: string;
}

// Combined interface that includes both common and requirement-specific strings
export type IUIStrings = ICommonUIStrings & IBrandUIStrings;

export const CommonUIStrings: ICommonUIStrings = {
   kWarning: "Warning:",
   kInfo: "Information:",
   kError: "Error:",
   kSuccess: "Success:",
   kServerErrorDescription: "Sorry, we could not get a response from the server, Please try again later.",
   kHomeTitle: "Strong AI Technologies",
   kPrivacyTitle: "Privacy Policy",
   kTermsTitle: "Terms of Service",
   kHome: "Home",
   kPrivacy: "Privacy",
   kTerms: "Terms",
   kChat: "Chat",
   kAIWarning: "AI can make mistakes. Think about it.",
   kProcessingPleaseWait: "Please wait a few seconds...",
   kArchivingPleaseWait: "Please wait a few seconds...",
   kArchivingDescription: "Summarising and cleaning out old messages to make room for new ones.",
   kLoginBlocked: "Sorry, this login attempt was blocked due to security concerns from our Google screening service. Please try again later.",
   kAdditionalVerification: "Sorry, additional verification is required by our Google screening service. Please try again later.",
   kTooManyAttempts: "Sorry, this login attempt has been flagged as suspicious by our Google screening service. Please wait a while before trying again.",
   kLoginFailed: "Sorry, the login attempt failed. Please try again, or refresh the whole page.",
   kLogoutFailed: "Sorry, we were not able to complete logout. Please try again, or refresh the whole page."
}

export const TheYardBrandStrings: IBrandUIStrings = {
   kAppPageCaption: "Yard Talk",
   kAppPageStrapline: "Where sweat meets sass.",
   kOverview: "We're trialling something new – and no, it's not more burpees. Meet our 'Yard Talk' chatbot; your online training assistant here to answer fitness-related questions, chat about CrossFit, and maybe even stop you from skipping Engines. For the next three months, we're testing how AI can support our community. Try it out, ask it anything (health and fitness-related, please), and let us know what you think – your feedback will shape what comes next.",
   kLinks: "",
   kChatPreamble: "Chat to the Yard Talk AI by typing your question in the box below. Don't share private information.",
   kChatPlaceholder: "Let's talk about fitness...",
   kLooksOffTopic: "Sorry, that looks off-topic. We should just talk about fitness. Please try again."
}

export const DemoBrandStrings: IBrandUIStrings = {
   kAppPageCaption: "Strong AI Demo",
   kAppPageStrapline: "Strong and Intelligent.",
   kOverview: "Strong AI Technologies helps small gym owners thrive by giving them the power of cutting-edge, AI-enabled tools that support their members beyond the gym floor.",
   kLinks: "",
   kChatPreamble: "Chat to the Strong AI by typing your question in the box below. Don't share private information.",
   kChatPlaceholder: "Let's talk about fitness...",
   kLooksOffTopic: "Sorry, that looks off-topic. We should just talk about fitness. Please try again."
}

// UI strings that combine common and brand strings
const TheYardUIString: IUIStrings = {
   ...CommonUIStrings,
   ...TheYardBrandStrings
}

const DemoUIString: IUIStrings = {
   ...CommonUIStrings,
   ...DemoBrandStrings
}

// Function to get common UI strings 
export function getCommonUIStrings(): ICommonUIStrings {
   return CommonUIStrings;
}

// Function to get all UI strings based on the current mode
export function getUIStrings(mode: EAssistantPersonality): IUIStrings {
   switch (mode) {
      case EAssistantPersonality.kTheYardAssistant:
         return TheYardUIString;
      case EAssistantPersonality.kDemoAssistant:
         return DemoUIString;
      default:
         return TheYardUIString;
   }
}

