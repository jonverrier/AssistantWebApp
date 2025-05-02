/**
 * index.tsx
 * 
 * Entry point for the React application.
 */
// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { createRoot } from "react-dom/client";

import { EAppMode } from './UIStrings';
import { RoutedSite } from './Site';

// This allows code to be loaded in node.js for tests, even if we dont run actual React methods
if (document !== undefined && document.getElementById !== undefined) {
   const root = createRoot(document.getElementById("reactRoot") as HTMLElement);

   root.render(
      <RoutedSite appMode={EAppMode.kYardTalk} />
   ); 
}