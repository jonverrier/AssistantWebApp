/**
 * index.tsx
 * 
 * Entry point for the React application.
 */
// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { createRoot } from "react-dom/client";

import { RoutedSite } from './Site';
import { PrivacySite } from './PrivacySite';
import { TermsSite } from './TermsSite';

// This allows code to be loaded in node.js for tests, even if we dont run actual React methods
if (document !== undefined && document.getElementById !== undefined) {
   const root = createRoot(document.getElementById("reactRoot") as HTMLElement);

   // Check which page we're on
   const path = window.location.pathname;
   const isPrivacyPage = path.includes('privacy');
   const isTermsPage = path.includes('terms');

   root.render(
      isPrivacyPage ? <PrivacySite /> :
      isTermsPage ? <TermsSite /> :
      <RoutedSite />
   ); 
}