/**
 * TermsSite.tsx
 * 
 * A standalone page component for displaying the terms of service.
 * This is separate from the main site to ensure Google Sign-In can detect it as a distinct page.
 */

import React from 'react';
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { PlainText } from './PlainText';
import { getCommonUIStrings } from './UIStrings';
import { kTermsContent } from './TermsContent';
import { ESiteType } from './SiteUtilities';
import { UserProvider } from './UserContext';
import { browserSessionStorage } from './LocalStorage';
import { BrowserRouter } from 'react-router-dom';

// Terms site component props
export interface ITermsSiteProps {
}

// Terms site component
export const TermsSite = (props: ITermsSiteProps) => {
   const uiStrings = getCommonUIStrings();

   return (
      <FluentProvider theme={teamsDarkTheme}>
         <UserProvider storage={browserSessionStorage}>
            <BrowserRouter future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
            }}>
               <PlainText 
                  title={uiStrings.kTermsTitle} 
                  content={kTermsContent} 
                  siteType={ESiteType.kTerms}
               />
            </BrowserRouter>
         </UserProvider>
      </FluentProvider>
   );
} 