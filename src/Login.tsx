/**
 * Login.tsx
 * 
 * Login component that handles user authentication and session management.
 * Implements Google client login API for user authentication.
 * Acts as a wrapper around the App component, providing user context.
 */

// Copyright (c) Jon Verrier, 2025

import React, { useState, useEffect, useRef } from 'react';
import { Text } from '@fluentui/react-components';

import { App } from './App';
import { EAppMode } from './UIStrings';
import { getSessionUuid } from './SessionCall';
import { Footer, Spacer } from './SiteUtilities';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { standardTextStyles } from './CommonStyles';
import { getUIStrings } from './UIStrings';
import { isAppInLocalhost, IStorage, USER_ID_STORAGE_KEY, USER_NAME_STORAGE_KEY } from './LocalStorage';
import { uuidv4 } from './uuid';

declare global {
   interface Window {
      onGoogleLogin: (response: any) => void;
      google?: any;
   }
}

const local = window.location.hostname === 'localhost';
const sessionApiUrl = local ? 'http://localhost:7071/api/Session' : 'https://motifassistantapi.azurewebsites.net/api/Session';

// Use different client IDs for local development and production
const CLIENT_ID = local 
   ? '603873085545-i8ptftpe1avq0p92l66glr8oodq3ok5e.apps.googleusercontent.com'  // Development
   : '603873085545-i8ptftpe1avq0p92l66glr8oodq3ok5e.apps.googleusercontent.com'; // Production

// Login component props
export interface ILoginProps {
   appMode: EAppMode;
   storage: IStorage;
}

// Login UI component props
interface ILoginUiProps extends ILoginProps {
   googleButtonRef: React.RefObject<HTMLDivElement>;
}

// Login component
export const Login = (props: ILoginProps) => {

   const [sessionId, setSessionId] = useState<string | undefined>(undefined);
   const [userId, setUserId] = useState<string | undefined>(undefined);
   const [userName, setUserName] = useState<string | undefined>(undefined);
   const [isGoogleLogin, setIsGoogleLogin] = useState(false);
   const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);

   const googleButtonRef = useRef<HTMLDivElement>(null);

   // If we are running locally, check for existing user ID in storage on mount
   useEffect(() => {

      if (isAppInLocalhost()) {
         const storedUserId = props.storage.get(USER_ID_STORAGE_KEY);
         const storedUserName = props.storage.get(USER_NAME_STORAGE_KEY);

         if (storedUserId && storedUserName) {
            setUserId(storedUserId);
            setUserName(storedUserName);
            setIsGoogleLogin(false);
            // Get session ID for stored user
            getSessionUuid(sessionApiUrl).then(newSession => {
               if (newSession) {
                  setSessionId(newSession);
               } else {
                  // If no session ID returned, create a temporary one
                  setSessionId(uuidv4());
               }
            });
         }
      }
   }, [props.storage]);

   // Handle successful login
   const handleLogin = async (credential: string) => {
      try {
         const decodedToken = JSON.parse(atob(credential.split('.')[1]));
         const newUserId = decodedToken.sub;
         setUserId(newUserId);
         setUserName(decodedToken.name || undefined);
         setIsGoogleLogin(true);

         // Store the user ID and name
         props.storage.set(USER_ID_STORAGE_KEY, newUserId);
         props.storage.set(USER_NAME_STORAGE_KEY, decodedToken.name || undefined);

         // Get session ID after successful login
         const newSession = await getSessionUuid(sessionApiUrl);
         if (newSession) {
            setSessionId(newSession);
         }
      } catch (error) {
         console.error('Error processing login:', error);
         setUserId(undefined);
         setUserName(undefined);
         setSessionId(undefined);
      }
   };

   // Initialize Google Sign-In
   useEffect(() => {
      const initializeGoogle = () => {
         if (!window.google?.accounts?.id || !googleButtonRef.current || isGoogleInitialized) {
            return;
         }

         try {
            // Set up the callback first
            window.onGoogleLogin = async (response) => {
               const credential = response?.credential;
               if (credential) {
                  await handleLogin(credential);
               }
            };

            // Initialize Google Sign-In with FedCM enabled
            window.google.accounts.id.initialize({
               client_id: CLIENT_ID,
               callback: window.onGoogleLogin,
               auto_select: true,
               cancel_on_tap_outside: true,
               use_fedcm_for_prompt: true // Enable FedCM
            });

            // Render the button
            window.google.accounts.id.renderButton(googleButtonRef.current, {
               type: 'standard',
               size: 'large',
               theme: 'outline',
               text: 'sign_in_with',
               shape: 'rectangular',
               logo_alignment: 'center',
               width: 250
            });

            setIsGoogleInitialized(true);
         } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
         }
      };

      initializeGoogle();

      // Clean up function
      return () => {
         if (window.google?.accounts?.id) {
            window.google.accounts.id.cancel();
            if (userId && isGoogleLogin) {
               window.google.accounts.id.revoke(userId, () => {
                  console.log('User sign-in state revoked');
               });
            }
         }
      };
   }, [isGoogleInitialized, userId, isGoogleLogin]);

   // Handle auto-login prompt
   useEffect(() => {
      const storedUserId = props.storage.get(USER_ID_STORAGE_KEY);
      
      // Only attempt auto-login if there's no stored user and no current user
      if (isGoogleInitialized && !userName && !storedUserId) {
         const attemptAutoLogin = async () => {
            try {
               const moment = await window.google?.accounts?.id?.prompt();
               // FedCM compatible moment checking
               if (moment?.isNotDisplayed()) {
                  console.log('Auto-login prompt not displayed:', moment.getNotDisplayedReason());
               } else if (moment?.isSkippedMoment()) {
                  console.log('Auto-login skipped:', moment.getSkippedReason());
               } else if (moment?.isDismissedMoment()) {
                  console.log('Auto-login dismissed:', moment.getDismissedReason());
               } else if (moment?.isDisplayMoment()) {
                  console.log('Auto-login prompt displayed successfully');
               }
            } catch (error) {
               console.error('Error during auto-login attempt:', error);
            }
         };

         // Small delay to ensure everything is properly initialized
         const promptTimeout = setTimeout(attemptAutoLogin, 1000);
         return () => clearTimeout(promptTimeout);
      }
   }, [isGoogleInitialized, userName, props.storage]);

   return (
      <div 
         data-testid="login-container" 
         data-session-id={sessionId}
         className="login-container"
      >
         {!userName && <LoginView appMode={props.appMode} googleButtonRef={googleButtonRef} storage={props.storage} />}
         {userName && sessionId && (
            <App 
               appMode={props.appMode}
               forceNode={false}
               userName={userName}
               sessionId={sessionId}
            />
         )}
      </div>
   );
}; 

// Login view component
export const LoginView = (props: ILoginUiProps) => {
   
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const textClasses = standardTextStyles();
   const uiStrings = getUIStrings(props.appMode);

   return (
      <div className={pageOuterClasses.root}>
         <div className={innerColumnClasses.root}>
            <Text className={textClasses.heading}>{uiStrings.kAppPageCaption}</Text>
            <Text className={textClasses.centredHint}>{uiStrings.kAppPageStrapline}</Text>
            <Spacer />
            <Text>{uiStrings.kOverview}</Text>
            <Spacer />
            <div ref={props.googleButtonRef} className="google-login-button"></div>         
            <Footer />
         </div>
      </div>
   );
};


