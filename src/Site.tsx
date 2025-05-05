/**
 * Site.tsx
 * 
 * Configures the application routing and theme provider setup.
 * Defines the main site structure using React Router and Fluent UI's theme provider.
 * Handles routing between the main application view and static content pages.
 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { BrowserRouter, useRoutes } from "react-router-dom";
import { App } from "./App";
import { PlainText } from './PlainText';
import { FluentProvider , teamsDarkTheme } from '@fluentui/react-components';
import { EAppMode, getUIStrings } from './UIStrings';

import { kTermsContent } from './TermsContent';
import { kPrivacyContent } from './PrivacyContent';

export interface IRoutedSiteProps {
   appMode: EAppMode;
}

export const RoutedSite = (props: IRoutedSiteProps) => {

   return (
      <FluentProvider theme={teamsDarkTheme}>
            <BrowserRouter future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
               }}>
               <Site appMode={props.appMode} />
            </BrowserRouter>
      </FluentProvider>
   );
}

export interface ISiteProps {
   appMode: EAppMode;
}

export const Site = (props: ISiteProps) => {
   
   const uiStrings = getUIStrings(props.appMode);
   
   const routes = useRoutes([
      {
         path: '/',
         element: <App appMode={props.appMode} forceNode={false} />
      },
      {
         path: '/index',
         element: <App appMode={props.appMode} forceNode={false} />
      },
      {
         path: '/index.html',
         element: <App appMode={props.appMode} forceNode={false} />
      },
      {
         path: '/privacy',
         element: <PlainText title={uiStrings.kPrivacyTitle} content={kPrivacyContent} />
      },
      {
         path: '/privacy.html',
         element: <PlainText title={uiStrings.kPrivacyTitle} content={kPrivacyContent} />
      },
      {
         path: '/terms',
         element: <PlainText title={uiStrings.kTermsTitle} content={kTermsContent} />
      },
      {
         path: '/terms.html',
         element: <PlainText title={uiStrings.kTermsTitle} content={kTermsContent} />
      },
      {
         path: '*',
         element: <App appMode={props.appMode} forceNode={false} />
      }
   ]);

   return routes;
}



