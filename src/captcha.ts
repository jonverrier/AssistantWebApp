/**
 * ReCaptchaUtils.ts
 * 
 * Utility functions for handling Google reCAPTCHA v3 verification.
 * Provides functions to execute reCAPTCHA checks and handle low scores.
 */

// Copyright (c) Jon Verrier, 2025

import { ApiClient, createRetryableAxiosClient } from './ChatCallUtils';
import { IAssistantCaptchaRequest, IAssistantCaptchaResponse } from '../import/AssistantChatApiTypes';
import { isAppInLocalhost } from './LocalStorage';
import { getConfigStrings } from './ConfigStrings';

export const RECAPTCHA_THRESHOLD = 0.5; // Scores below this are considered suspicious
export const RECAPTCHA_ADDITIONAL_VERIFY_THRESHOLD = 0.4;
export const RECAPTCHA_BLOCK_THRESHOLD = 0.3;

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

// Add type definition for window.grecaptcha
declare global {
   interface Window {
      grecaptcha: {
         ready: (callback: () => void) => void;
         execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
   }
}

/**
 * Executes reCAPTCHA verification for a specific action
 * @param captchaUrl The URL of the API to validate the reCAPTCHA token
 * @param action The action name to verify (e.g., 'login', 'submit')
 * @returns Promise resolving to the verification result
 */
export async function executeReCaptcha(captchaUrl: string, action: string, apiClient?: ApiClient): Promise<IReCaptchaExecuteResult> {
   try {
      if (isAppInLocalhost()) {
         return {
            success: true,
            score: 1.0
         };
      }

      if (!window.grecaptcha) {
         let errorMessage = 'reCAPTCHA not loaded.';
         console.error(errorMessage);
         return {
            success: false,
            error: errorMessage
         };
      }

      // Wait for reCAPTCHA to be ready
      await new Promise<void>((resolve) => window.grecaptcha.ready(resolve));

      if (!apiClient) {
         apiClient = createRetryableAxiosClient();
      }

      const config = getConfigStrings();
      const token = await window.grecaptcha.execute(config.googleCaptchaSiteKey, { action });

      const request: IAssistantCaptchaRequest = {
         token,
         action
      };

      const response = await apiClient.post<IAssistantCaptchaResponse>(
         captchaUrl,
         request
      );

      return {
         success: response.data.isValid,
         score: response.data.score
      };

   } catch (error) {
      let errorMessage = 'Failed to execute reCAPTCHA';
      console.error(errorMessage + ': ' + error);
      return {
         success: false,
         error: errorMessage
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