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
import { Message, MessageIntent } from './Message';

import { App } from './App';
import { EAppMode } from './UIStrings';
import { getSessionUuid } from './SessionCall';
import { Footer, Spacer } from './SiteUtilities';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { standardTextStyles } from './CommonStyles';
import { getUIStrings, UIStrings, replaceStringParameter } from './UIStrings';
import { isAppInLocalhost, IStorage, USER_ID_STORAGE_KEY, USER_NAME_STORAGE_KEY } from './LocalStorage';
import { uuidv4 } from './uuid';
import { executeReCaptcha, handleLowScore, 
   SECURITY_STEP_BLOCK_REQUEST,
   SECURITY_STEP_LOG_SUSPICIOUS,
   SECURITY_STEP_ADDITIONAL_VERIFICATION,
   SECURITY_STEP_RATE_LIMIT
} from './captcha';

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

const containerStyles: React.CSSProperties = {
   display: 'flex',
   flexDirection: 'column',
   alignItems: 'center',
   justifyContent: 'center',
   minHeight: '100vh',
   padding: '20px'
};

const innerStyles: React.CSSProperties = {
   width: '100%',
   maxWidth: '600px',
   display: 'flex',
   flexDirection: 'column',
   alignItems: 'center',
   gap: '20px'
};

// Rate limiting constants
const RATE_LIMIT_INITIAL_DELAY = 2000; // 2 seconds
const RATE_LIMIT_MAX_DELAY = 30000; // 30 seconds
const RATE_LIMIT_RESET_TIME = 60000; // 1 minute

// Login component props
export interface ILoginProps {
   appMode: EAppMode;
   storage: IStorage;
   forceNode?: boolean;
}

// Login view component props
interface ILoginUiProps extends ILoginProps {
   googleButtonRef: React.RefObject<HTMLDivElement>;
   error?: string;
   setError: (error: string | undefined) => void;
   isWaiting: boolean;
}

// Login component
// This component is responsible for handling the login process, 
// including reCAPTCHA verification, rate limiting, and Google Sign-In.
export const Login = (props: ILoginProps) => {

   const local = isAppInLocalhost();
   
   const captchaUrl = local ? 'http://localhost:7071/api/Captcha' : 'https://motifassistantapi.azurewebsites.net/api/Captcha';
      
   const [userId, setUserId] = useState<string | undefined>(props.storage.get(USER_ID_STORAGE_KEY));
   const [userName, setUserName] = useState<string | undefined>(props.storage.get(USER_NAME_STORAGE_KEY));
   const [sessionId, setSessionId] = useState<string | undefined>();
   const [isGoogleLogin, setIsGoogleLogin] = useState<boolean>(false);
   const [isGoogleInitialized, setIsGoogleInitialized] = useState<boolean>(false);
   const [error, setError] = useState<string | undefined>();
   const [googleCredential, setGoogleCredential] = useState<string | undefined>();
   
   // Rate limiting state
   const [rateLimitAttempts, setRateLimitAttempts] = useState<number>(0);
   const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
   const [isWaiting, setIsWaiting] = useState<boolean>(false);

   const googleButtonRef = useRef<HTMLDivElement>(null);

   // Handle logout and revoke access
   const handleLogout = async () => {
      try {
         if (isGoogleLogin && window.google?.accounts?.id) {
            // Revoke Google access
            window.google.accounts.id.disableAutoSelect();
            
            // If there's an active session, revoke it
            if (googleCredential) {
               const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${googleCredential}`, {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                  }
               });

               if (!response.ok) {
                  console.warn('Failed to revoke Google token:', response.statusText);
               }
            }
         }

         // Clear local storage
         props.storage.remove(USER_ID_STORAGE_KEY);
         props.storage.remove(USER_NAME_STORAGE_KEY);

         // Reset state
         setUserId(undefined);
         setUserName(undefined);
         setSessionId(undefined);
         setIsGoogleLogin(false);
         setGoogleCredential(undefined);

         // Re-initialize Google Sign-In if needed
         if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
               client_id: CLIENT_ID,
               callback: window.onGoogleLogin,
               auto_select: true,
               cancel_on_tap_outside: false
            });
         }
      } catch (error) {
         console.error('Error during logout:', error);
         setError(UIStrings.kLogoutFailed);
      }
   };

   // Handle successful login
   const handleLogin = async (credential: string) => {
      try {
         // First verify with reCAPTCHA
         const recaptchaResult = await executeReCaptcha(captchaUrl, 'login');
         
         if (!recaptchaResult.success) {
            // Handle low score
            const securitySteps = handleLowScore(recaptchaResult.score || 0);
            
            if (securitySteps.includes(SECURITY_STEP_BLOCK_REQUEST)) {
               setError(UIStrings.kLoginBlocked);
               return;
            }
            
            if (securitySteps.includes(SECURITY_STEP_ADDITIONAL_VERIFICATION)) {
               setError(UIStrings.kAdditionalVerification);
               return;
            }
            
            // Enhanced rate limiting with exponential backoff
            if (securitySteps.includes(SECURITY_STEP_RATE_LIMIT)) {
               setRateLimitAttempts(prev => prev + 1);
               setLastAttemptTime(Date.now());
               
               const delay = calculateRateLimitDelay();
               setError(UIStrings.kTooManyAttempts);
               setIsWaiting(true);
               setTimeout(() => {
                  setIsWaiting(false);
               }, delay);            
            }
         }

         const decodedToken = JSON.parse(atob(credential.split('.')[1]));
         const newUserId = decodedToken.sub;
         setUserId(newUserId);
         setUserName(decodedToken.name || undefined);
         setIsGoogleLogin(true);
         setGoogleCredential(credential);

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
         setGoogleCredential(undefined);
         setError(UIStrings.kLoginFailed);
      }
   };

   // Calculate rate limit delay based on number of attempts
   const calculateRateLimitDelay = () => {
      const timeSinceLastAttempt = Date.now() - lastAttemptTime;
      
      // Reset attempts if enough time has passed
      if (timeSinceLastAttempt > RATE_LIMIT_RESET_TIME) {
         setRateLimitAttempts(0);
         return 0;
      }

      // Exponential backoff with maximum limit
      const delay = Math.min(
         RATE_LIMIT_INITIAL_DELAY * Math.pow(2, rateLimitAttempts),
         RATE_LIMIT_MAX_DELAY
      );

      return delay;
   };

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

   // Initialize Google Sign-In
   useEffect(() => {
      const initializeGoogle = () => {
         if (!window.google?.accounts?.id || !googleButtonRef.current || isGoogleInitialized) {
            return;
         }

         try {
            window.onGoogleLogin = (response: any) => {
               handleLogin(response.credential);
            };

            window.google.accounts.id.initialize({
               client_id: CLIENT_ID,
               callback: window.onGoogleLogin,
               auto_select: true,
               cancel_on_tap_outside: false
            });

            window.google.accounts.id.renderButton(googleButtonRef.current, {
               theme: 'outline',
               size: 'large',
               width: 250
            });

            setIsGoogleInitialized(true);
         } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
         }
      };

      initializeGoogle();
   }, [isGoogleInitialized, userId]);

   // Handle auto-login prompt
   useEffect(() => {
      const storedUserId = props.storage.get(USER_ID_STORAGE_KEY);
      
      // Only attempt auto-login if there's no stored user and no current user
      if (isGoogleInitialized && !userName && !storedUserId) {
         const attemptAutoLogin = async () => {
            try {
               window.google?.accounts?.id?.prompt();
            } catch (error) {
               console.error('Error prompting for auto-login:', error);
            }
         };

         // Add a small delay before prompting
         const promptTimeout = setTimeout(attemptAutoLogin, 1000);
         return () => clearTimeout(promptTimeout);
      }
   }, [isGoogleInitialized, userName, props.storage]);

   return (
      <div style={containerStyles} data-testid="login-container" data-session-id={sessionId}>
         <div style={innerStyles}>
            {!userName || !sessionId ? (
               <LoginView 
                  appMode={props.appMode}
                  storage={props.storage}
                  forceNode={props.forceNode}
                  googleButtonRef={googleButtonRef}
                  error={error}
                  setError={setError}
                  isWaiting={isWaiting}
               />
            ) : (
               <App
                  appMode={props.appMode}
                  sessionId={sessionId}
                  userName={userName}
                  forceNode={props.forceNode || false}
               />
            )}
         </div>
         <Footer />
      </div>
   );
};

// Login view component
// This component is responsible for rendering the login view of the application.
// It includes the login form, error message, and Google login button.
export const LoginView = (props: ILoginUiProps) => {
   
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const textClasses = standardTextStyles();
   const uiStrings = getUIStrings(props.appMode);

   const handleErrorDismiss = () => {
      props.setError(undefined);
   };

   return (
      <div className={pageOuterClasses.root} data-testid="login-view">
         <div className={innerColumnClasses.root}>
            <Text className={textClasses.heading}>{uiStrings.kAppPageCaption}</Text>
            <Text className={textClasses.centredHint}>{uiStrings.kAppPageStrapline}</Text>
            <Spacer />
            <Text>{uiStrings.kOverview}</Text>
            {props.error && (
               <>
                  <Spacer />
                  <Message
                     intent={MessageIntent.kError}
                     title={UIStrings.kError}
                     body={props.error}
                     dismissable={true}
                     onDismiss={handleErrorDismiss}
                  />
               </>
            )}            
            <Spacer />
            <div 
               ref={props.googleButtonRef} 
               className="google-login-button" 
               style={{ display: props.isWaiting ? 'none' : 'block' }}
            />         
            <Footer />
         </div>
      </div>
   );
};


