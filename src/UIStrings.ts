/**
 * UIStrings.ts
 * 
 * Defines UI strings used throughout the application. Centralizes all text content
 * for easy localization and maintenance. 
 */
/*! Copyright Jon Verrier 2025 */

export { EMultilineEditUIStrings } from './MultilineEditUIStrings';

// Type for the current linter mode
export enum EAppMode {
   kYardTalk = "yardtalk"
}

// Common strings used across all linters
export interface ICommonUIStrings {
   kWarning: string;
   kInfo: string;
   kError: string;
   kSuccess: string;
   kServerErrorDescription: string;
   kHome: string;
   kPrivacyTitle: string;
   kTermsTitle: string;
   kPrivacy: string;
   kTerms: string;
   kAIWarning: string;
   kArchivingPleaseWait: string;
   kArchivingDescription: string;
   kProcessingPleaseWait: string;
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
   kHome: "Home",
   kPrivacyTitle: "Privacy Policy",
   kTermsTitle: "Terms of Service",
   kPrivacy: "Privacy",
   kTerms: "Terms",
   kAIWarning: "AI can make mistakes. Think about it.",
   kProcessingPleaseWait: "Please wait a few seconds...",
   kArchivingPleaseWait: "Please wait a few seconds...",
   kArchivingDescription: "Summarising and cleaning out old messages to make room for new ones."
}

export const TheYardUIStrings: IBrandUIStrings = {
   kAppPageCaption: "Yard Talk",
   kAppPageStrapline: "Where sweat meets sass.",
   kOverview: "The Yard Peckham is proudly the home of CrossFit Peckham. Above all else, we are committed to the improvement of human life and dedicated to offering high quality coaching in an environment that will help you achieve your health, fitness and performance goals. We hope our Yard Talk AI will help along the way. Enjoy.",
   kLinks: "[CrossFit main site](https://www.crossfit.com/), [The Yard](https://www.theyardpeckham.com/)",
   kChatPreamble: "Chat to the Yard Talk AI by typing your question in the box below. Don't share private information.",
   kChatPlaceholder: "Let's talk about fitness...",
   kLooksOffTopic: "Sorry, that looks off-topic. We should just talk about fitness. Please try again."
}



// Default UI strings that combine common and brand strings
export const UIStrings: IUIStrings = {
   ...CommonUIStrings,
   ...TheYardUIStrings
}

// Function to get the appropriate UI strings based on the current mode
export function getUIStrings(mode: EAppMode): IUIStrings {
   switch (mode) {
      case EAppMode.kYardTalk:
         return UIStrings;
      default:
         return UIStrings;
   }
}

