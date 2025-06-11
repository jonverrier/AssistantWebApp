/**
 * PrivacySite.tsx
 * 
 * A standalone page component for displaying the privacy policy.
 * This is separate from the main site to ensure Google Sign-In can detect it as a distinct page.
 */

import React from 'react';
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { PlainText } from './PlainText';
import { getCommonUIStrings } from './UIStrings';
import { kPrivacyContent } from './PrivacyContent';
import { ESiteType } from './SiteUtilities';
import { UserProvider } from './UserContext';
import { browserSessionStorage } from './LocalStorage';
import { BrowserRouter } from 'react-router-dom';

// Privacy site component props
export interface IPrivacySiteProps {
}

// Privacy site component
export const PrivacySite = (props: IPrivacySiteProps) => {
   const uiStrings = getCommonUIStrings();

   return (
       <FluentProvider theme={teamsDarkTheme}>
           <UserProvider storage={browserSessionStorage}>
               <BrowserRouter future={{
                   v7_startTransition: true,
                   v7_relativeSplatPath: true
               }}>
                   <PlainText
                       title={uiStrings.kPrivacyTitle}
                       content={kPrivacyContent}
                       siteType={ESiteType.kPrivacy}
                   />
               </BrowserRouter>
           </UserProvider>
       </FluentProvider>
   );
} 