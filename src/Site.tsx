/**
 * Site.tsx
 * 
 * Configures the application routing and theme provider setup.
 * Defines the main site structure using React Router and Fluent UI's theme provider.
 * Handles routing between the main application view and static content pages.
 */

// Copyright (c) Jon Verrier, 2025

import React, { useEffect } from 'react';
import { BrowserRouter, useRoutes, Navigate } from "react-router-dom";
import { Login } from "./Login";
import { PlainText } from './PlainText';
import { Home } from './Home';
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { getCommonUIStrings } from './UIStrings';
import { UserProvider, useUser } from './UserContext';
import { browserSessionStorage } from './LocalStorage';
import { ScrollToTop } from './ScrollToTop';

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
               <ScrollToTop />
               <Site />
            </BrowserRouter>
         </UserProvider>
      </FluentProvider>
   );
}

// Site component props
export interface ISiteProps {
}

const PersonalityRedirect = ({ 
   personality,
   to 
}: { 
   personality: EAssistantPersonality,
   to: string 
}) => {
   const { setPersonality, setSessionId } = useUser();

   useEffect(() => {
      setPersonality(personality);
      // Reset the session ID if the user switches to a new personality
      // This will force the app to requesta  new session from the server
      setSessionId(undefined);
   }, [personality, setPersonality, setSessionId]);

   return <Navigate to={to} replace />;
};

// Site component
export const Site = (props: ISiteProps) => {
   const { personality } = useUser();
   const uiStrings = getCommonUIStrings();

   const routes = useRoutes([
      {
         path: '/',
         element: <Home title={uiStrings.kHomeTitle} strapline={uiStrings.kHomeStrapline} content={kAboutContent} launchButton={true} />
      },
      {
         path: '/about',
         element: <Home title={uiStrings.kAboutTitle} strapline={uiStrings.kAboutStrapline} content={kAboutContent} launchButton={false} />
      },
      {
         path: '/about.html',
         element: <Home title={uiStrings.kAboutTitle} strapline={uiStrings.kAboutStrapline} content={kAboutContent} launchButton={false} />
      },
      {
         path: '/theyard',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kTheYardAssistant} 
            to="/chat" 
         />
      },
      {
         path: '/theyard.html',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kTheYardAssistant} 
            to="/chat" 
         />
      },
      {
         path: '/crank',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kCrankAssistant} 
            to="/chat" 
         />
      },
      {
         path: '/crank.html',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kCrankAssistant} 
            to="/chat" 
         />
      },
      {
         path: '/demo',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kDemoAssistant} 
            to="/chat" 
         />
      },
      {
         path: '/demo.html',
         element: <PersonalityRedirect 
            personality={EAssistantPersonality.kDemoAssistant} 
            to="/chat" 
         />
      },
      {
         path: '/chat',
         element: personality ? <Login personality={personality} /> : <Navigate to="/" replace />
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
         element: <Navigate to="/" replace />
      }
   ]);

   return routes;
}


