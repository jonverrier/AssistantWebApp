/**
 * Site.tsx
 *
 * Configures the application routing and theme provider setup.
 * Defines the main site structure using React Router and Fluent UI's theme provider.
 * Handles routing between the main application view and static content pages.
 */
import React from 'react';
interface GoogleAccountsId {
    initialize: (config: {
        client_id: string;
        callback: (response: any) => void;
        auto_select: boolean;
        cancel_on_tap_outside: boolean;
    }) => void;
    renderButton: (element: HTMLElement, config: {
        theme: string;
        size: string;
        width: number;
    }) => void;
    prompt: () => void;
    disableAutoSelect: () => void;
}
interface GoogleAccounts {
    id: GoogleAccountsId;
}
interface GoogleType {
    accounts: GoogleAccounts;
}
export {};
declare global {
    var onGoogleLogin: undefined | ((response: any) => void);
    var google: undefined | GoogleType;
}
export interface IRoutedSiteProps {
}
export declare const RoutedSite: (props: IRoutedSiteProps) => React.JSX.Element;
export interface ISiteProps {
}
export declare const Site: (props: ISiteProps) => React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
//# sourceMappingURL=Site.d.ts.map