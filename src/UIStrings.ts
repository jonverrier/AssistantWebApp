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
   kProcessing: string;
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
}

// Strings that vary between different white labelled implementations
export interface ISpecificationUIStrings {
   kAppPageCaption: string;
   kAppPageStrapline: string;
   kLinks: string;
   kChatPreamble: string;
   kChatPlaceholder: string;
   kResponsePlaceholder: string;
   kLooksOffTopic: string;
}

// Combined interface that includes both common and requirement-specific strings
export type IUIStrings = ICommonUIStrings & ISpecificationUIStrings;


export const CommonUIStrings: ICommonUIStrings = {
   kProcessing: "Processing. This may take several seconds.",
   kWarning: "Warning:",
   kInfo: "Information:",
   kError: "Error:",
   kSuccess: "Success:",
   kServerErrorDescription: "Sorry, we could not get a response from the server, Please try again later.",
   kHome: "Home",
   kPrivacyTitle: "Privacy Policy",
   kTermsTitle: "Terms of Service",
   kPrivacy: "Privacy",
   kTerms: "Terms"
}

export const TheYardUIStrings: ISpecificationUIStrings = {
   kAppPageCaption: "Yard Talk",
   kAppPageStrapline: "Where sweat meets sass, and we lift until we drop.",
   kLinks: "[CrossFit main site](https://www.crossfit.com/), [The Yard](https://www.theyardpeckham.com/)",
   kChatPreamble: "Chat to the Yard Talk AI by entering your question in the edit box. Treat your content as public:",
   kChatPlaceholder: "Enter your question...",
   kResponsePlaceholder: "When your question is answered, the answer will appear here.",
   kLooksOffTopic: "That looks off-topic. Please try again."
}



// Default UI strings that combine common and requirement strings
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

