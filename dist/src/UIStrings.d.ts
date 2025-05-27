/**
 * UIStrings.ts
 *
 * Defines UI strings used throughout the application. Centralizes all text content
 * for easy localization and maintenance.
 */
/*! Copyright Jon Verrier 2025 */
export { EMultilineEditUIStrings } from './MultilineEditUIStrings';
/**
 * Replaces a parameter placeholder in a string with a value.
 * @param template The string template containing {x} placeholders where x is a number
 * @param parameter The value to replace the placeholder with
 * @param index The index of the parameter to replace (defaults to 0)
 * @returns The string with the placeholder replaced
 */
export declare function replaceStringParameter(template: string, parameter: string | number, index?: number): string;
export declare enum EAppMode {
    kYardTalk = "yardtalk"
}
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
    kLoginBlocked: string;
    kAdditionalVerification: string;
    kTooManyAttempts: string;
    kLoginFailed: string;
    kLogoutFailed: string;
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
export declare const TheYardUIStrings: IBrandUIStrings;
export declare const UIStrings: IUIStrings;
export declare function getUIStrings(mode: EAppMode): IUIStrings;
//# sourceMappingURL=UIStrings.d.ts.map