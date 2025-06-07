/**
 * UserContext module provides React context for managing user authentication state.
 * 
 * This module exports a UserContext and UserProvider component that maintains user session information including:
 * - User ID
 * - User name 
 * - Session ID
 * - User role
 * - Assistant personality/facility type
 * 
 * The provider component handles persisting the user state to storage and provides methods for login/logout.
 */
/*! Copyright Jon Verrier 2025 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ID_STORAGE_KEY, USER_NAME_STORAGE_KEY, SESSION_STORAGE_KEY, USER_FACILITY_PERSONALITY_KEY, USER_ROLE_KEY, IStorage } from './LocalStorage';
import { EUserRole, EAssistantPersonality } from '../import/AssistantChatApiTypes';

interface UserContextType {
   userId: string | undefined;
   userName: string | undefined;
   sessionId: string | undefined;
   userRole: EUserRole | undefined;
   personality: EAssistantPersonality | undefined;
   setPersonality: (personality: EAssistantPersonality) => void;
   setSessionId: (sessionId: string | undefined) => void;
   onLogin: (userFacility: EAssistantPersonality, 
      userId: string, 
      userName: string, 
      sessionId: string, 
      userRole: EUserRole) => void;
   onLogout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
   children: React.ReactNode;
   storage: IStorage;
}

export function UserProvider({ children, storage }: UserProviderProps) {
   const [userId, setUserId] = useState<string | undefined>(() => {
      return storage.get(USER_ID_STORAGE_KEY) || undefined;
   });
   const [userName, setUserName] = useState<string | undefined>(() => {
      return storage.get(USER_NAME_STORAGE_KEY) || undefined;
   });
   const [sessionId, setSessionId] = useState<string | undefined>(() => {
      return storage.get(SESSION_STORAGE_KEY) || undefined;
   });
   const [personality, setPersonality] = useState<EAssistantPersonality | undefined>(() => {
      const storedPersonality = storage.get(USER_FACILITY_PERSONALITY_KEY);
      return storedPersonality ? storedPersonality as EAssistantPersonality : undefined;
   });
   const [userRole, setUserRole] = useState<EUserRole | undefined>(() => {
      const storedRole = storage.get(USER_ROLE_KEY);
      return storedRole ? storedRole as EUserRole : undefined;
   });


   // Persist state changes to storage
   useEffect(() => {
      if (userId) {
         storage.set(USER_ID_STORAGE_KEY, userId);
      } else {
         storage.remove(USER_ID_STORAGE_KEY);
      }
   }, [userId, storage]);

   useEffect(() => {
      if (userName) {
         storage.set(USER_NAME_STORAGE_KEY, userName);
      } else {
         storage.remove(USER_NAME_STORAGE_KEY);
      }
   }, [userName, storage]);

   useEffect(() => {
      if (sessionId) {
         storage.set(SESSION_STORAGE_KEY, sessionId);
      } else {
         storage.remove(SESSION_STORAGE_KEY);
      }
   }, [sessionId, storage]);

   useEffect(() => {
      if (personality) {
         storage.set(USER_FACILITY_PERSONALITY_KEY, personality);
      } else {
         storage.remove(USER_FACILITY_PERSONALITY_KEY);
      }
   }, [personality, storage]);

   useEffect(() => {
      if (userRole) {
         storage.set(USER_ROLE_KEY, userRole);
      } else {
         storage.remove(USER_ROLE_KEY);
      }
   }, [userRole, storage]);

   const handleSetPersonality = (newPersonality: EAssistantPersonality) => {
      setPersonality(newPersonality);
   };

   const handleLogin = (facilityPersonality: EAssistantPersonality, 
      userId: string, 
      userName: string, 
      sessionId: string, 
      userRole: EUserRole) => {
      setUserId(userId);
      setUserName(userName);
      setSessionId(sessionId);
      setPersonality(facilityPersonality);
      setUserRole(userRole);
   };

   const handleLogout = () => {
      setUserId(undefined);
      setUserName(undefined);
      setSessionId(undefined);
      setPersonality(undefined);
      setUserRole(undefined);
      storage.remove(USER_ID_STORAGE_KEY);
      storage.remove(USER_NAME_STORAGE_KEY);
      storage.remove(SESSION_STORAGE_KEY);
      storage.remove(USER_FACILITY_PERSONALITY_KEY);
      storage.remove(USER_ROLE_KEY);
   };

   return (
      <UserContext.Provider 
         value={{
            userId,
            userName,
            sessionId,
            userRole,
            personality,
            setSessionId,
            setPersonality: handleSetPersonality,
            onLogin: handleLogin,
            onLogout: handleLogout,
         }}
      >
         {children}
      </UserContext.Provider>
   );
}

export function useUser() : UserContextType {
   const context = useContext(UserContext);
   if (context === undefined) {
      throw new Error('useUser must be used within a UserProvider');
   }
   return context;
} 