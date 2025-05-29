/**
 * Site.tsx
 * 
 * Configures the application routing and theme provider setup.
 * Defines the main site structure using React Router and Fluent UI's theme provider.
 * Handles routing between the main application view and static content pages.
 */

// Copyright (c) Jon Verrier, 2025

import React, { useEffect, useState } from 'react';
import { BrowserRouter, useRoutes, redirect, Navigate } from "react-router-dom";
import { Login } from "./Login";
import { PlainText } from './PlainText';
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { getCommonUIStrings } from './UIStrings';
import { UserProvider, useUser } from './UserContext';
import { browserSessionStorage } from './LocalStorage';

import { kTermsContent } from './TermsContent';
import { kPrivacyContent } from './PrivacyContent';
import { kAboutContent } from './AboutContent';
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';

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
               <Site />
            </BrowserRouter>
         </UserProvider>
      </FluentProvider>
   );
}

// Site component props
export interface ISiteProps {
}

const DEFAULT_PERSONALITY = EAssistantPersonality.kDemoAssistant;

const PersonalityRedirect = ({ 
   personality,
   to 
}: { 
   personality: EAssistantPersonality,
   to: string 
}) => {
   const { setPersonality } = useUser();
   
   useEffect(() => {
      setPersonality(personality);
   }, [personality, setPersonality]);

   return <Navigate to={to} />;
};

// Site component
export const Site = (props: ISiteProps) => {
   const { personality, setPersonality } = useUser();
   const uiStrings = getCommonUIStrings();

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
         element: <Login personality={personality ?? DEFAULT_PERSONALITY} />
      },
      {
         path: '/index',
         element: <Login personality={personality ?? DEFAULT_PERSONALITY} />
      },
      {
         path: '/index.html',
         element: <Login personality={personality ?? DEFAULT_PERSONALITY} />
      },
      {
         path: '/theyard',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kTheYardAssistant} 
            to="/index" 
         />
      },
      {
         path: '/theyard.html',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kTheYardAssistant} 
            to="/index" 
         />
      },
      {
         path: '/demo',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kDemoAssistant} 
            to="/index" 
         />
      },
      {
         path: '/demo.html',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kDemoAssistant} 
            to="/index" 
         />
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
         path: '/about',
         element: <PlainText title={uiStrings.kAboutTitle} content={kAboutContent} />
      },
      {
         path: '/about.html',
         element: <PlainText title={uiStrings.kAboutTitle} content={kAboutContent} />
      },
      {
         path: '*',
         element: <Login personality={personality ?? DEFAULT_PERSONALITY} />
      }
   ]);

   return routes;
}


