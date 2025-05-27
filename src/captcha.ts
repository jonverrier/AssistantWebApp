/**
 * ReCaptchaUtils.ts
 * 
 * Utility functions for handling Google reCAPTCHA v3 verification.
 * Provides functions to execute reCAPTCHA checks and handle low scores.
 */

// Copyright (c) Jon Verrier, 2025

export const RECAPTCHA_THRESHOLD = 0.5; // Scores below this are considered suspicious
export const RECAPTCHA_ADDITIONAL_VERIFY_THRESHOLD = 0.4;
export const RECAPTCHA_BLOCK_THRESHOLD = 0.3;


const RECAPTCHA_SITE_KEY = '6LcHeTcrAAAAAEo5t4RU00Y9X3zwYm_tzvnan5j3';

// Security step constants
export const SECURITY_STEP_BLOCK_REQUEST = 'block_request';
export const SECURITY_STEP_LOG_SUSPICIOUS = 'log_suspicious_activity';
export const SECURITY_STEP_ADDITIONAL_VERIFICATION = 'require_additional_verification';
export const SECURITY_STEP_RATE_LIMIT = 'rate_limit';

export interface IReCaptchaExecuteResult {
    success: boolean;
    score?: number;
    error?: string;
}

/**
 * Executes reCAPTCHA verification for a specific action
 * @param action The action name to verify (e.g., 'login', 'submit')
 * @returns Promise resolving to the verification result
 */
export async function executeReCaptcha(action: string): Promise<IReCaptchaExecuteResult> {
    try {
        if (!window.grecaptcha) {
            return {
                success: false,
                error: 'reCAPTCHA not loaded'
            };
        }

        const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
        
        // Here you would typically send this token to your backend for verification
        // For now, we're using the mock score from the client side
        // In production, NEVER trust the client-side score
        const score = Math.random(); // Mock score - replace with actual backend verification

        return {
            success: score >= RECAPTCHA_THRESHOLD,
            score
        };
    } catch (error) {
        console.error('reCAPTCHA execution failed:', error);
        return {
            success: false,
            error: 'Failed to execute reCAPTCHA'
        };
    }
}

/**
 * Handles low reCAPTCHA scores by implementing additional security measures
 * @param score The reCAPTCHA score (0.0 to 1.0)
 * @returns Additional security steps to take
 */
export function handleLowScore(score: number): string[] {
    const securitySteps: string[] = [];

    if (score < RECAPTCHA_THRESHOLD) {
        // Add security measures based on score ranges
        if (score < RECAPTCHA_BLOCK_THRESHOLD) {
            securitySteps.push(SECURITY_STEP_BLOCK_REQUEST);
            securitySteps.push(SECURITY_STEP_LOG_SUSPICIOUS);
        } else if (score < RECAPTCHA_ADDITIONAL_VERIFY_THRESHOLD) {
            securitySteps.push(SECURITY_STEP_ADDITIONAL_VERIFICATION);
            securitySteps.push(SECURITY_STEP_RATE_LIMIT);
        } else {
            securitySteps.push(SECURITY_STEP_RATE_LIMIT);
        }
    }

    return securitySteps;
}

// Add type definition for window.grecaptcha
declare global {
    interface Window {
        grecaptcha: {
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
} 