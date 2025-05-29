/**
 * ConfigStrings.ts
 * 
 * Defines configuration strings used throughout the application, particularly URLs.
 * Centralizes all environment-specific configurations for easy maintenance.
 */
/*! Copyright Jon Verrier 2025 */

import { isAppInLocalhost } from './LocalStorage';

// Common configuration strings that don't vary between environments
export interface ICommonConfigStrings {
   googleCaptchaClientId: string;
   loginAction: string;
   termsAction: string;
   privacyAction: string;
   homeAction: string;
   aboutAction: string;
   reCaptchaSiteKey: string;
}

// Environment-specific configuration strings
export interface IEnvironmentConfigStrings {
   screenUrl: string;
   chatUrl: string;
   messagesApiUrl: string;
   archiveApiUrl: string;
   summariseApiUrl: string;
   captchaApiUrl: string;
   sessionApiUrl: string;
}

// Combined interface that includes both common and environment-specific strings
export type IConfigStrings = ICommonConfigStrings & IEnvironmentConfigStrings;

// Common configuration strings
const CommonConfigStrings: ICommonConfigStrings = {
   googleCaptchaClientId: '603873085545-i8ptftpe1avq0p92l66glr8oodq3ok5e.apps.googleusercontent.com',
   loginAction: 'login',
   termsAction: 'terms',
   privacyAction: 'privacy',
   homeAction: 'home',
   aboutAction: 'about',
   reCaptchaSiteKey: '6LcHeTcrAAAAAEo5t4RU00Y9X3zwYm_tzvnan5j3'
};

// Local (development) configuration strings
const LocalEnvironmentStrings: IEnvironmentConfigStrings = {
   screenUrl: 'http://localhost:7071/api/ScreenInput',
   chatUrl: 'http://localhost:7071/api/StreamChat',
   messagesApiUrl: 'http://localhost:7071/api/GetMessages',
   archiveApiUrl: 'http://localhost:7071/api/ArchiveMessages',
   summariseApiUrl: 'http://localhost:7071/api/SummariseMessages',
   captchaApiUrl: 'http://localhost:7071/api/Captcha',
   sessionApiUrl: 'http://localhost:7071/api/Session'
};

// Remote (production) configuration strings
const RemoteEnvironmentStrings: IEnvironmentConfigStrings = {
   screenUrl: 'https://motifassistantapi.azurewebsites.net/api/ScreenInput',
   chatUrl: 'https://motifassistantapi.azurewebsites.net/api/StreamChat',
   messagesApiUrl: 'https://motifassistantapi.azurewebsites.net/api/GetMessages',
   archiveApiUrl: 'https://motifassistantapi.azurewebsites.net/api/ArchiveMessages',
   summariseApiUrl: 'https://motifassistantapi.azurewebsites.net/api/SummariseMessages',
   captchaApiUrl: 'https://motifassistantapi.azurewebsites.net/api/Captcha',
   sessionApiUrl: 'https://motifassistantapi.azurewebsites.net/api/Session'
};

/**
 * Returns the appropriate configuration strings based on the environment.
 * @returns IConfigStrings - The configuration strings for the current environment
 */
export function getConfigStrings(): IConfigStrings {
   return {
      ...CommonConfigStrings,
      ...(isAppInLocalhost() ? LocalEnvironmentStrings : RemoteEnvironmentStrings)
   };
} 