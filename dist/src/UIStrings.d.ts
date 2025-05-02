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
export interface ISpecificationUIStrings {
    kAppPageCaption: string;
    kAppPageStrapline: string;
    kLinks: string;
    kChatPreamble: string;
    kChatPlaceholder: string;
    kResponsePlaceholder: string;
    kLooksOffTopic: string;
}
export type IUIStrings = ICommonUIStrings & ISpecificationUIStrings;
export declare const CommonUIStrings: ICommonUIStrings;
export declare const TheYardUIStrings: ISpecificationUIStrings;
export declare const UIStrings: IUIStrings;
export declare function getUIStrings(mode: EAppMode): IUIStrings;
//# sourceMappingURL=UIStrings.d.ts.map