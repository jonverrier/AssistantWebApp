/**
 * Login.tsx
 * 
 * Provides login functionality with Google OAuth and reCAPTCHA verification.
 * Includes rate limiting and security measures.
 */
/*! Copyright Jon Verrier 2025 */

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { EAssistantPersonality, ELoginProvider, EUserRole, EShowInterstitialPrompt } from '../import/AssistantChatApiTypes';
import { getSessionData } from './SessionCall';
import { executeReCaptcha, handleLowScore, SECURITY_STEP_BLOCK_REQUEST, SECURITY_STEP_ADDITIONAL_VERIFICATION, SECURITY_STEP_RATE_LIMIT } from './captcha';
import { getConfigStrings } from './ConfigStrings';
import { getUIStrings } from './UIStrings';
import { ConsoleLoggingContext, getLogger } from './LoggingUtilities';
import { ELoggerType } from './LoggingTypes';

// Create a shared logging context for internal errors
const internalLogger = getLogger(new ConsoleLoggingContext(), ELoggerType.kInternal);

// Extend Window interface
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
                renderButton: (element: HTMLElement, config: {
                    theme: string;
                    size: string;
                    width: number;
                }) => void;
                prompt: () => void;
                disableAutoSelect: () => void;
            };
        };
    };
}

interface ILoginProps {
    personality: EAssistantPersonality;
    user?: {
        onLogin: (personality: string, userId: string, email: string, sessionId: string, role: EUserRole) => void;
    };
}

/**
 * Login component that handles user authentication.
 * 
 * @param props - The component props
 * @returns The rendered login component
 */
export const Login = (props: ILoginProps) => {
    const [error, setError] = useState<string | undefined>();
    const [isWaiting, setIsWaiting] = useState(false);
    const [rateLimitAttempts, setRateLimitAttempts] = useState(0);
    const [lastAttemptTime, setLastAttemptTime] = useState(0);
    const [sessionId, setSessionId] = useState<string | undefined>();
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const config = getConfigStrings();
    const uiStrings = getUIStrings(props.personality);
    const { user } = props;

    useEffect(() => {
        // Set up Google Sign-In callback
        const handleGoogleResponse = (response: any) => {
            if (response.credential) {
                handleLogin(response.credential);
            } else {
                internalLogger.logError('No credential received from Google login');
                setError(uiStrings.kLoginFailed);
            }
        };

        window.onGoogleLogin = handleGoogleResponse;

        // Initialize Google Sign-In
        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: config.googleClientId,
                callback: handleGoogleResponse,
                auto_select: true,
                cancel_on_tap_outside: false
            });

            // Render the button
            if (googleButtonRef.current) {
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    width: 250
                });
            }
        }
    }, []);

    // Calculate rate limit delay based on number of attempts
    const calculateRateLimitDelay = () => {
        const timeSinceLastAttempt = Date.now() - lastAttemptTime;
        
        // Reset attempts if enough time has passed
        if (timeSinceLastAttempt > 30 * 60 * 1000) { // 30 minutes
            setRateLimitAttempts(0);
            return 0;
        }

        // Exponential backoff: 2^n seconds, where n is the number of attempts
        return Math.min(Math.pow(2, rateLimitAttempts) * 1000, 30 * 60 * 1000); // Max 30 minutes
    };

    // Handle successful login
    const handleLogin = async (credential: string) => {
        try {
            // First verify with reCAPTCHA
            const recaptchaResult = await executeReCaptcha(config.captchaApiUrl, config.loginAction);
            
            internalLogger.logInput(`reCAPTCHA result: ${JSON.stringify(recaptchaResult)}`);
            
            if (!recaptchaResult.success) {
                // Handle low score
                const securitySteps = handleLowScore(recaptchaResult.score || 0);
                
                if (securitySteps.includes(SECURITY_STEP_BLOCK_REQUEST)) {
                    setError(uiStrings.kLoginBlocked);
                    internalLogger.logError('Login blocked due to low reCAPTCHA score');
                    return;
                }
                
                if (securitySteps.includes(SECURITY_STEP_ADDITIONAL_VERIFICATION)) {
                    setError(uiStrings.kAdditionalVerification);
                    internalLogger.logError('Additional verification required due to low reCAPTCHA score');
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
                    
                    internalLogger.logError(`Rate limit applied: ${delay}ms delay after ${rateLimitAttempts} attempts`);
                    return;
                }
            }

            const decodedToken = JSON.parse(atob(credential.split('.')[1]));
            const userId = decodedToken.sub;
            const userName = decodedToken.name || undefined;
            const userEmail = decodedToken.email || undefined;

            // Get session ID
            let sessionResponse;
            try {
                let userDetails = {
                    userID: userId,
                    name: userName,
                    email: userEmail,
                    loginProvider: ELoginProvider.kGoogle
                };
                
                sessionResponse = await getSessionData(config.sessionApiUrl, userDetails, props.personality);
                internalLogger.logResponse(`Session created for user ${userId}`);
            } catch (error) {
                internalLogger.logError(`Error getting session ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            // If no session ID returned, create a temporary one
            if (!sessionResponse) {
                sessionResponse = {
                    sessionId: uuidv4(),
                    role: EUserRole.kGuest,
                    showInterstitialPrompt: EShowInterstitialPrompt.kNone
                };
            }

            // Set the session ID for testing purposes
            setSessionId(sessionResponse.sessionId);

            // Update user context
            if (user) {
                user.onLogin(
                    props.personality,
                    userId,
                    userEmail || '',
                    sessionResponse.sessionId,
                    sessionResponse.role
                );
                internalLogger.logResponse('User context updated successfully');
            }
        } catch (error) {
            internalLogger.logError(`Error during login: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setError(uiStrings.kLoginFailed);
        }
    };

    return (
        <div data-testid="login-container" data-session-id={sessionId}>
            <div data-testid="login-view">
                {error && <div className="error">{error}</div>}
                {!isWaiting && (
                    <div ref={googleButtonRef} className="google-login-button" />
                )}
            </div>
        </div>
    );
};


