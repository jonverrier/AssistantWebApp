/**
 * Cookie.ts
 * 
 * Handles interaction with the cookie API to obtain and parse session UUIDs.
 */
/*! Copyright Jon Verrier 2025 */

import axios from 'axios';
import { ISessionRequest, ISessionResponse, EUserRole, IUserDetails, EAssistantPersonality } from '../import/AssistantChatApiTypes';

/**
 * Calls the session API to get a session UUID and user role.
 * 
 * This function sends the provided user details to the server.
 * The server's response containing the session ID and user role is returned.
 * 
 * @param sessionApiUrl - The URL of the session API
 * @param userDetails - The user's details including email, ID, name and login provider
 * @returns The session response containing session ID and user role if successful, undefined if there's an error
 */
export async function getSessionData(
    sessionApiUrl: string,
    userDetails: IUserDetails,
    personality: EAssistantPersonality
): Promise<ISessionResponse | undefined> {
    try {
        // Prepare the request
        const request: ISessionRequest = {
            userDetails,
            personality
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