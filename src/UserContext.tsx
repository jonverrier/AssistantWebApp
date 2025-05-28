import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ID_STORAGE_KEY, USER_NAME_STORAGE_KEY, SESSION_STORAGE_KEY, IStorage } from './LocalStorage';

interface UserContextType {
   userId: string | undefined;
   userName: string | undefined;
   sessionId: string | undefined;
   onLogin: (userId: string, userName: string, sessionId: string) => void;
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

   const handleLogin = (newUserId: string, newUserName: string, newSessionId: string) => {
      setUserId(newUserId);
      setUserName(newUserName);
      setSessionId(newSessionId);
   };

   const handleLogout = () => {
      setUserId(undefined);
      setUserName(undefined);
      setSessionId(undefined);
      storage.remove(USER_ID_STORAGE_KEY);
      storage.remove(USER_NAME_STORAGE_KEY);
      storage.remove(SESSION_STORAGE_KEY);
   };

   return (
      <UserContext.Provider 
         value={{
            userId,
            userName,
            sessionId,
            onLogin: handleLogin,
            onLogout: handleLogout
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