/**
 * PageUtilities.tsx
 *
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */
import React from 'react';
export interface IHeaderProps {
    title: string;
}
export declare const Header: React.FC<IHeaderProps>;
export declare enum ESpacerSize {
    kSmall = 8,
    kMedium = 14,
    kLarge = 20,
    kXLarge = 32
}
export interface ISpacerProps {
    size?: ESpacerSize;
}
export declare const Spacer: (props: ISpacerProps) => React.JSX.Element;
export declare enum ESiteType {
    kMain = "main",
    kPrivacy = "privacy",
    kTerms = "terms"
}
export interface IFooterProps {
    siteType: ESiteType;
}
export declare const Footer: (props: IFooterProps) => React.JSX.Element;
//# sourceMappingURL=SiteUtilities.d.ts.map