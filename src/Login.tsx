/**
 * Login.tsx
 * 
 * Login component that handles user authentication and session management.
 * Currently a placeholder that will be enhanced with Google client login API.
 * Acts as a wrapper around the App component, providing user context.
 */

// Copyright (c) Jon Verrier, 2025

import React, { useState, useEffect } from 'react';
import { App } from './App';
import { EAppMode } from './UIStrings';
import { getSessionUuid } from './SessionCall';

const local = window.location.hostname === 'localhost';
const sessionApiUrl = local ? 'http://localhost:7071/api/Session' : 'https://motifassistantapi.azurewebsites.net/api/Session';

export interface ILoginProps {
   appMode: EAppMode;
}

export const Login = (props: ILoginProps) => {
   const [sessionId, setSessionId] = useState<string>(`session-${Date.now()}`);
   
   useEffect(() => {
      const getSession = async () => {
         const existingSession = await getSessionUuid(sessionApiUrl);
         if (existingSession) {
            setSessionId(existingSession);
         }
      };
      getSession();
   }, []);

   // Temporary implementation before Google login integration
   const tempUserName = 'Guest';

   return (
      <div data-testid="login-container">
         <App 
            appMode={props.appMode}
            forceNode={false}
            userName={tempUserName}
            sessionId={sessionId}
         />
      </div>
   );
}; 