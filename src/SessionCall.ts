/**
 * Cookie.ts
 * 
 * Handles interaction with the cookie API to obtain and parse session UUIDs.
 */
/*! Copyright Jon Verrier 2025 */

import { ISessionRequest, ISessionResponse, EUserRole, IUserDetails, EAssistantPersonality, EShowInterstitialPrompt } from '../import/AssistantChatApiTypes';
import { createRetryableAxiosClient } from './ApiCallUtils';
import { ConsoleLoggingContext, getLogger } from './LoggingUtilities';
import { ELoggerType } from './LoggingTypes';
import { getConfigStrings } from './ConfigStrings';

// Create logger
const apiLogger = getLogger(new ConsoleLoggingContext(), ELoggerType.kApi);

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

        // Create API client
        const apiClient = createRetryableAxiosClient();

        // Make the API call
        apiLogger.logInput(`Session API call to ${sessionApiUrl} with data: ${JSON.stringify(request)}`);
        const response = await apiClient.post<ISessionResponse>(sessionApiUrl, request);
        apiLogger.logResponse(`Session API response data: ${JSON.stringify(response.data)}`);

        // Get the session ID and user rolefrom the response
        const newSessionId = response?.data?.sessionId || undefined;
        const userRole = response?.data?.role || EUserRole.kGuest;
        const showInterstitialPrompt = response?.data?.showInterstitialPrompt || EShowInterstitialPrompt.kNone;
        
        if (!newSessionId) {
            apiLogger.logError('No sessionId in response');
            return undefined;
        }
        
        return { sessionId: newSessionId, role: userRole, showInterstitialPrompt: showInterstitialPrompt };

    } catch (error) {
        const config = getConfigStrings();
        apiLogger.logError(`Error getting session UUID: ${error instanceof Error ? error.message : config.unknownError}`);
        return undefined;
    }
} 