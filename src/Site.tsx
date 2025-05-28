/**
 * Site.tsx
 * 
 * Configures the application routing and theme provider setup.
 * Defines the main site structure using React Router and Fluent UI's theme provider.
 * Handles routing between the main application view and static content pages.
 */

// Copyright (c) Jon Verrier, 2025

import React, { useEffect } from 'react';
import { BrowserRouter, useRoutes } from "react-router-dom";
import { Login } from "./Login";
import { PlainText } from './PlainText';
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { EAppMode, getUIStrings } from './UIStrings';
import { getConfigStrings } from './ConfigStrings';
import { isAppInLocalhost } from './LocalStorage';
import { UserProvider, useUser } from './UserContext';
import { browserSessionStorage } from './LocalStorage';

import { kTermsContent } from './TermsContent';
import { kPrivacyContent } from './PrivacyContent';
import { IStorage } from './LocalStorage';

// Type definitions for Google Sign-In
interface GoogleAccountsId {
   initialize: (config: {
      client_id: string;
      callback: (response: any) => void;
      auto_select: boolean;
      cancel_on_tap_outside: boolean;
   }) => void;
   renderButton: (
      element: HTMLElement,
      config: {
         theme: string;
         size: string;
         width: number;
      }
   ) => void;
   prompt: () => void;
   disableAutoSelect: () => void;
}

interface GoogleAccounts {
   id: GoogleAccountsId;
}

interface GoogleType {
   accounts: GoogleAccounts;
}

// Extend Window interface
export {};
declare global {
   var onGoogleLogin: undefined | ((response: any) => void);
   var google: undefined | GoogleType;
}

// Routed site component props
export interface IRoutedSiteProps {
   appMode: EAppMode;
}

// Routed site component
export const RoutedSite = (props: IRoutedSiteProps) => {
   return (
      <FluentProvider theme={teamsDarkTheme}>
         <UserProvider storage={browserSessionStorage}>
            <BrowserRouter future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
            }}>
               <Site appMode={props.appMode} />
            </BrowserRouter>
         </UserProvider>
      </FluentProvider>
   );
}

// Site component props
export interface ISiteProps {
   appMode: EAppMode;
}

// Site component
export const Site = (props: ISiteProps) => {
   const uiStrings = getUIStrings(props.appMode);

   // Initialize Google Sign-In
   useEffect(() => {
      // Load Google Sign-In script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
         const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
         if (scriptElement && scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
         }
      };
   }, []);

   const routes = useRoutes([
      {
         path: '/',
         element: <Login appMode={props.appMode} />
      },
      {
         path: '/index',
         element: <Login appMode={props.appMode} />
      },
      {
         path: '/index.html',
         element: <Login appMode={props.appMode} />
      },
      {
         path: '/privacy',
         element: <PlainText title={uiStrings.kPrivacyTitle} content={kPrivacyContent} />
      },
      {
         path: '/privacy.html',
         element: <PlainText title={uiStrings.kPrivacyTitle} content={kPrivacyContent} />
      },
      {
         path: '/terms',
         element: <PlainText title={uiStrings.kTermsTitle} content={kTermsContent} />
      },
      {
         path: '/terms.html',
         element: <PlainText title={uiStrings.kTermsTitle} content={kTermsContent} />
      },
      {
         path: '*',
         element: <Login appMode={props.appMode} />
      }
   ]);

   return routes;
}


