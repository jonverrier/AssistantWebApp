/**
 * Cookie.ts
 * 
 * Handles interaction with the cookie API to obtain and parse session UUIDs.
 */
/*! Copyright Jon Verrier 2025 */

import axios from 'axios';
import { ISessionRequest, ISessionResponse } from '../import/AssistantChatApiTypes';
import { IStorage, browserStorage, SESSION_STORAGE_KEY, USER_NAME_STORAGE_KEY } from './LocalStorage';

/**
 * Calls the cookie API to get a session UUID.
 * 
 * This function first checks storage for an existing session ID.
 * If found, it sends that to the server. If not, it requests a new session.
 * The server's response is stored and returned.
 * 
 * @param cookieApiUrl - The URL of the cookie API
 * @param storage - Storage implementation to use (defaults to browser storage)
 * @returns The session UUID if successful, undefined if there's an error
 */
export async function getSessionUuid(
    cookieApiUrl: string, 
    storage: IStorage = browserStorage
): Promise<string | undefined> {
    try {
        // Check storage first
        const existingSessionId = storage.get(SESSION_STORAGE_KEY);
        const userName = storage.get(USER_NAME_STORAGE_KEY);

        // Prepare the request
        const request: ISessionRequest = {
            email: userName,
            sessionId: existingSessionId || undefined
        };

        // Make the API call
        const response = await axios.post<ISessionResponse>(cookieApiUrl, request, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Get the session ID from the response
        const sessionId = response?.data?.sessionId || undefined;
        
        if (!sessionId) {
            console.error('No sessionId in response');
            return undefined;
        }

        // Store the session ID
        storage.set(SESSION_STORAGE_KEY, sessionId);
        
        return sessionId;

    } catch (error) {
        console.error('Error getting session UUID:', error);
        return undefined;
    }
} 