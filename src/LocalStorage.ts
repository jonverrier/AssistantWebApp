/**
 * LocalStorage.ts
 * 
 * Provides a storage interface and implementation for browser local storage.
 */
/*! Copyright Jon Verrier 2025 */

export const SESSION_STORAGE_KEY = 'motif_session_id';
export const USER_ID_STORAGE_KEY = 'motif_user_id';
export const USER_NAME_STORAGE_KEY = 'motif_user_name';

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
 * Interface for storage operations.
 * Allows operation in Node.js for testing. 
 * In Node.js it won't persist data, so we use a MockStorage implementation for testing
 */
export interface IStorage {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
}

// Default browser storage implementation
export const browserStorage: IStorage = {
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
    }
}; 