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
export declare function replaceStringParameter(template: string, parameter: string | number, index?: number): string;
export interface ICommonUIStrings {
    kWarning: string;
    kInfo: string;
    kError: string;
    kSuccess: string;
    kServerErrorDescription: string;
    kHomeTitle: string;
    kAboutTitle: string;
    kPrivacyTitle: string;
    kTermsTitle: string;
    kHome: string;
    kChat: string;
    kPrivacy: string;
    kTerms: string;
    kAbout: string;
    kAIWarning: string;
    kLoginPlease: string;
    kArchivingPleaseWait: string;
    kArchivingDescription: string;
    kProcessingPleaseWait: string;
    kLoginBlocked: string;
    kAdditionalVerification: string;
    kTooManyAttempts: string;
    kLoginFailed: string;
    kLogoutFailed: string;
    kGuestLoginNotice: string;
}
export interface IBrandUIStrings {
    kAppPageCaption: string;
    kAppPageStrapline: string;
    kOverview: string;
    kLinks: string;
    kChatPreamble: string;
    kChatPlaceholder: string;
    kLooksOffTopic: string;
}
export type IUIStrings = ICommonUIStrings & IBrandUIStrings;
export declare const CommonUIStrings: ICommonUIStrings;
export declare const TheYardBrandStrings: IBrandUIStrings;
export declare const CrankBrandStrings: IBrandUIStrings;
export declare const DemoBrandStrings: IBrandUIStrings;
export declare function getCommonUIStrings(): ICommonUIStrings;
export declare function getUIStrings(mode: EAssistantPersonality): IUIStrings;
//# sourceMappingURL=UIStrings.d.ts.map