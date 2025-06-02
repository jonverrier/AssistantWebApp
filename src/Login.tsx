/**
 * Login.tsx
 * 
 * Login component that handles user authentication and session management.
 * Implements Google client login API for user authentication.
 * Acts as a wrapper around the App component, providing user context.
 */

// Copyright (c) Jon Verrier, 2025

import React, { useState, useEffect, useRef } from 'react';
import { EAssistantPersonality, ISessionResponse, EUserRole, IUserDetails, ELoginProvider } from '../import/AssistantChatApiTypes';

import { Text } from '@fluentui/react-components';
import { Message, MessageIntent } from './Message';
import { ESpacerSize, Header } from './SiteUtilities';
import { App } from './App';
import { getSessionData } from './SessionCall';
import { Footer, Spacer } from './SiteUtilities';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { standardTextStyles } from './CommonStyles';
import { getUIStrings } from './UIStrings';
import { uuidv4 } from './uuid';
import { executeReCaptcha, handleLowScore, 
   SECURITY_STEP_BLOCK_REQUEST,
   SECURITY_STEP_LOG_SUSPICIOUS,
   SECURITY_STEP_ADDITIONAL_VERIFICATION,
   SECURITY_STEP_RATE_LIMIT
} from './captcha';
import { getConfigStrings } from './ConfigStrings';
import { isAppInLocalhost } from './LocalStorage';
import { useUser } from './UserContext';


// Extend Window interface
export {};
declare global {
   var onGoogleLogin: undefined | ((response: any) => void);
   var google: undefined | {
      accounts: {
         id: {
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
         };
      };
   };
}

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
   personality: EAssistantPersonality;
}

// Login view component props
interface ILoginUiProps  {
   personality: EAssistantPersonality;   
   userName: string | undefined;
   sessionId: string | undefined;   
   googleButtonRef: React.RefObject<HTMLDivElement>;
   error?: string;
   setError: (error: string | undefined) => void;
   isWaiting: boolean;
}

// Login component
// This component is responsible for handling the login process, 
// including reCAPTCHA verification, rate limiting, and Google Sign-In.
export const Login = (props: ILoginProps) => {
   const config = getConfigStrings();
   const uiStrings = getUIStrings(props.personality);

   const user = useUser();
   const { userId, userName, sessionId, onLogin, onLogout } = user;
      
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
         if (window.google?.accounts?.id) {
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

         // Reset state
         setGoogleCredential(undefined);
         onLogout();

         // Re-initialize Google Sign-In
         if (window.google?.accounts?.id && window.onGoogleLogin) {
            window.google.accounts.id.initialize({
               client_id: config.googleCaptchaClientId,
               callback: window.onGoogleLogin,
               auto_select: true,
               cancel_on_tap_outside: false
            });
         }
      } catch (error) {
         console.error('Error during logout:', error);
         setError(uiStrings.kLogoutFailed);
      }
   };

   // Handle successful login
   const handleLogin = async (credential: string) => {
      try {
         // First verify with reCAPTCHA
         const recaptchaResult = await executeReCaptcha(config.captchaApiUrl, config.loginAction);
         
         if (!recaptchaResult.success) {
            // Handle low score
            const securitySteps = handleLowScore(recaptchaResult.score || 0);
            
            if (securitySteps.includes(SECURITY_STEP_BLOCK_REQUEST)) {
               setError(uiStrings.kLoginBlocked);
               return;
            }
            
            if (securitySteps.includes(SECURITY_STEP_ADDITIONAL_VERIFICATION)) {
               setError(uiStrings.kAdditionalVerification);
               return;
            }
            
            // Enhanced rate limiting with exponential backoff
            if (securitySteps.includes(SECURITY_STEP_RATE_LIMIT)) {
               setRateLimitAttempts(prev => prev + 1);
               setLastAttemptTime(Date.now());
               
               const delay = calculateRateLimitDelay();
               setError(uiStrings.kTooManyAttempts);
               setIsWaiting(true);
               setTimeout(() => {
                  setIsWaiting(false);
               }, delay);            
               return;
            }
         }

         const decodedToken = JSON.parse(atob(credential.split('.')[1]));
         const userId = decodedToken.sub;
         const userName = decodedToken.name || undefined;
         const userEmail = decodedToken.email || undefined;

         // Get session ID before updating state
         let newSessionId: ISessionResponse | undefined;
         try {
            let userDetails: IUserDetails = {
               userID: userId,
               name: userName,
               email: userEmail,
               loginProvider: ELoginProvider.kGoogle
            };
            newSessionId = await getSessionData(config.sessionApiUrl, userDetails, props.personality);
         } catch (error) {
            console.error('Error getting session ID:', error);
         }

         // If no session ID returned, create a temporary one
         if (!newSessionId) {
            newSessionId = { sessionId: uuidv4(), role: EUserRole.kGuest };
            console.warn('Using temporary session ID');
         }

         // Update user context
         if (user) {
            user.onLogin(
               props.personality,
               userId, 
               userEmail || '', 
               newSessionId.sessionId,                
               newSessionId.role               
            );
         }

      } catch (error) {
         console.error('Error during login:', error);
         setError(uiStrings.kLoginFailed);
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

   // Handle login 
   useEffect(() => {
      // Set up Google Sign-In callback regardless of whether the API is loaded
      // This ensures tests can access the callback even before the API loads
      window.onGoogleLogin = (response: any) => {
         if (response.credential) {
            handleLogin(response.credential);
         }
      };
      
      const googleApi = window.google?.accounts?.id;
      if (googleApi) {
         // Initialize Google Sign-In if API is available
         googleApi.initialize({
            client_id: config.googleCaptchaClientId,
            callback: window.onGoogleLogin,
            auto_select: true,
            cancel_on_tap_outside: false
         });

         // Only attempt auto-login if we dont yet have a userName, userId or sessionId
         // and we are not running locally
         if (!userName && !userId && !sessionId && !isAppInLocalhost()) {
            const attemptAutoLogin = async () => {
               try {
                  googleApi.prompt();
               } catch (error) {
                  console.error('Error prompting for auto-login:', error);
               }
            };

            // Add a small delay before prompting
            const promptTimeout = setTimeout(attemptAutoLogin, 1000);
            return () => clearTimeout(promptTimeout);
         }
      }
   }, [userName, userId, sessionId, config.googleCaptchaClientId]);

   // Render Google Sign-In button
   useEffect(() => {
      if (googleButtonRef.current && window.google?.accounts?.id) {
         window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 250
         });
      }
   }, [googleButtonRef.current]);

   return (
      <div style={containerStyles} data-testid="login-container" data-session-id={sessionId}>
         <div style={innerStyles}>
            {!userName || !sessionId ? (
               <LoginView 
                  personality={props.personality}
                  userName={userName}
                  sessionId={sessionId}
                  googleButtonRef={googleButtonRef}
                  error={error}
                  setError={setError}
                  isWaiting={isWaiting}
               />
            ) : (
               <App
                  personality={props.personality}
                  sessionId={sessionId}
                  email={userName}
                  onLogout={handleLogout}
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
   const uiStrings = getUIStrings(props.personality);

   const handleErrorDismiss = () => {
      props.setError(undefined);
   };

   return (
      <div className={pageOuterClasses.root} data-testid="login-view">
         <div className={innerColumnClasses.root}>
            <Header title={uiStrings.kAppPageCaption} />
            <Text className={textClasses.centredHint}>{uiStrings.kAppPageStrapline}</Text>
            <Spacer />
            <Text>{uiStrings.kOverview}</Text>
            <Spacer size={ESpacerSize.kLarge} />
            <Text>{uiStrings.kLoginPlease}</Text>
            {props.error && (
               <>
                  <Spacer />
                  <Message
                     intent={MessageIntent.kError}
                     title={uiStrings.kError}
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
         </div>
      </div>
   );
};


