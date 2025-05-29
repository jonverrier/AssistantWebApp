/**
 * Cookie.ts
 * 
 * Handles interaction with the cookie API to obtain and parse session UUIDs.
 */
/*! Copyright Jon Verrier 2025 */

import axios from 'axios';
import { ISessionRequest, ISessionResponse, EUserRole, IUserDetails } from '../import/AssistantChatApiTypes';

/**
 * Calls the cookie API to get a session UUID.
 * 
 * This function sends the provided email and sessionId to the server.
 * The server's response is returned.
 * 
 * @param sessionApiUrl - The URL of the cookie API
 * @param email - The user's email address
 * @returns The session UUID if successful, undefined if there's an error
 */
export async function getSessionData(
    sessionApiUrl: string,
    userDetails: IUserDetails
): Promise<ISessionResponse | undefined> {
    try {
        // Prepare the request
        const request: ISessionRequest = {
            userDetails
        };

        // Make the API call
        const response = await axios.post<ISessionResponse>(sessionApiUrl, request, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Get the session ID and user rolefrom the response
        const newSessionId = response?.data?.sessionId || undefined;
        const userRole = response?.data?.role || EUserRole.kGuest;
        
        if (!newSessionId) {
            console.error('No sessionId in response');
            return undefined;
        }
        
        return { sessionId: newSessionId, role: userRole };

    } catch (error) {
        console.error('Error getting session UUID:', error);
        return undefined;
    }
} 