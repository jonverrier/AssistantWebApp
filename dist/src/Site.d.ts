/**
 * Site.tsx
 *
 * Configures the application routing and theme provider setup.
 * Defines the main site structure using React Router and Fluent UI's theme provider.
 * Handles routing between the main application view and static content pages.
 */
import React from 'react';
import { EAppMode } from './UIStrings';
export interface IRoutedSiteProps {
    appMode: EAppMode;
}
export declare const RoutedSite: (props: IRoutedSiteProps) => React.JSX.Element;
export interface ISiteProps {
    appMode: EAppMode;
}
export declare const Site: (props: ISiteProps) => React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
//# sourceMappingURL=Site.d.ts.map