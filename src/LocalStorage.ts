/**
 * LocalStorage.ts
 * 
 * Provides a storage interface and implementation for browser local storage.
 */
/*! Copyright Jon Verrier 2025 */

export const SESSION_STORAGE_KEY = 'strong_session_id';
export const USER_ID_STORAGE_KEY = 'strong_user_id';
export const USER_NAME_STORAGE_KEY = 'strong_user_name';
export const USER_FACILITY_KEY = 'strong_user_facility';
export const USER_ROLE_KEY = 'strong_user_role';

/**
 * Check if the application is running on localhost
 * @returns boolean indicating if the app is running on localhost
 */
export const isAppInLocalhost = (): boolean => {
   if (typeof window !== 'undefined') {
       return window.location.hostname === 'localhost';
   }
   return false;
};

/**
 * Check if code is running in a browser context
 * @returns boolean indicating if we're in a browser environment
 */
export const isAppInBrowser = (): boolean => {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
};

/**
 * Interface for storage operations.
 * Allows operation in Node.js for testing. 
 * In Node.js it won't persist data, so we use a MockStorage implementation for testing
 */
export interface IStorage {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    remove(key: string): void;
}

// Default browser local storage implementation
export const browserLocalStorage: IStorage = {
    get: (key: string): string | undefined => {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            return localStorage.getItem(key) || undefined;
        }
        return undefined;
    },
    set: (key: string, value: string): void => {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    remove: (key: string): void => {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
        }
    }
}; 

// Browser session storage implementation
// Data persists for the page session (until browser/tab is closed)
export const browserSessionStorage: IStorage = {
    get: (key: string): string | undefined => {
        if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
            return sessionStorage.getItem(key) || undefined;
        }
        return undefined;
    },
    set: (key: string, value: string): void => {
        if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(key, value);
        }
    },
    remove: (key: string): void => {
        if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(key);
        }
    }
};

