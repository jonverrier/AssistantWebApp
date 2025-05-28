/**
 * Cookie.ts
 * 
 * Handles interaction with the cookie API to obtain and parse session UUIDs.
 */
/*! Copyright Jon Verrier 2025 */

import axios from 'axios';
import { ISessionRequest, ISessionResponse } from '../import/AssistantChatApiTypes';
import { IStorage, browserLocalStorage, SESSION_STORAGE_KEY, USER_NAME_STORAGE_KEY } from './LocalStorage';

/**
 * Calls the cookie API to get a session UUID.
 * 
 * This function sends the provided email and sessionId to the server.
 * The server's response is returned.
 * 
 * @param sessionApiUrl - The URL of the cookie API
 * @param email - The user's email address
 * @param sessionId - Optional existing session ID
 * @returns The session UUID if successful, undefined if there's an error
 */
export async function getSessionUuid(
    sessionApiUrl: string,
    email?: string,
    sessionId?: string
): Promise<string | undefined> {
    try {
        // Prepare the request
        const request: ISessionRequest = {
            email,
            sessionId
        };

        // Make the API call
        const response = await axios.post<ISessionResponse>(sessionApiUrl, request, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Get the session ID from the response
        const newSessionId = response?.data?.sessionId || undefined;
        
        if (!newSessionId) {
            console.error('No sessionId in response');
            return undefined;
        }
        
        return newSessionId;

    } catch (error) {
        console.error('Error getting session UUID:', error);
        return undefined;
    }
} 