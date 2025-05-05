/**
 * UIStrings.ts
 *
 * Defines UI strings used throughout the application. Centralizes all text content
 * for easy localization and maintenance.
 */
/*! Copyright Jon Verrier 2025 */
export { EMultilineEditUIStrings } from './MultilineEditUIStrings';
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