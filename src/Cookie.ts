/**
 * Cookie.ts
 * 
 * Handles interaction with the cookie API to obtain and parse session UUIDs.
 */
/*! Copyright Jon Verrier 2025 */

import axios from 'axios';

/**
 * Calls the cookie API to get a session UUID.
 * 
 * This function makes a GET request to the cookie API, which returns a Set-Cookie
 * header containing a session UUID. The function extracts and returns this UUID.
 * 
 * @param cookieApiUrl - The URL of the cookie API
 * @returns The session UUID if successful, undefined if there's an error
 */
export async function getSessionUuid(cookieApiUrl: string): Promise<string | undefined> {
    try {
        const response = await axios.get(cookieApiUrl, {
            withCredentials: true,  // Required for cookies to be set
            headers: {
                'Accept': 'application/json'
            }
        });

        // Get the Set-Cookie header
        const setCookie = response.headers['set-cookie'];
        if (!setCookie || !Array.isArray(setCookie) || setCookie.length === 0) {
            console.error('No Set-Cookie header received');
            return undefined;
        }

        // Find the sessionId cookie
        for (const cookie of setCookie) {
            const match = cookie.match(/sessionId=([^;]+)/);
            if (match) {
                return match[1];  // Return the UUID value
            }
        }

        console.error('No sessionId found in cookies');
        return undefined;

    } catch (error) {
        console.error('Error getting session UUID:', error);
        return undefined;
    }
} 