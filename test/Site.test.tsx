/**
 * Site.test.tsx
 * 
 * Unit tests for the RoutedSite and Site components using Mocha and expect.
 * Tests routing functionality and theme setup.
 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoutedSite, Site } from '../src/Site';
import { expect } from 'expect';
import { EAppMode, getUIStrings } from '../src/UIStrings';
import { MockStorage } from './MockStorage';

let appModes = [EAppMode.kYardTalk];

for (let appMode of appModes) {
   describe(`RoutedSite Component for ${appMode}`, () => {
      let mockStorage: MockStorage;

      beforeEach(() => {
         mockStorage = new MockStorage();
      });

      afterEach(() => {
         mockStorage.clear();
      });

      it('renders without crashing', () => {
         const { container } = render(
            <RoutedSite appMode={appMode} storage={mockStorage} />
         );
         expect(container).toBeTruthy();
      });
   });
}

for (let appMode of appModes) {
   describe(`Site Component for ${appMode}`, () => {
      const uiStrings = getUIStrings(appMode);
      let mockStorage: MockStorage;

      beforeEach(() => {
         mockStorage = new MockStorage();
      });

      afterEach(() => {
         mockStorage.clear();
      });
      
      it('renders App component for root path', () => {
         render(
            <MemoryRouter initialEntries={['/']}>
               <Site appMode={appMode} storage={mockStorage} />
            </MemoryRouter>
         );
         
         // Since App is rendered, we should see its content
         const privacyTitle = screen.getByText(uiStrings.kAppPageCaption);
         expect(privacyTitle).toBeTruthy();
      });

      it('renders App component for /index path', () => {
         render(
            <MemoryRouter initialEntries={['/index']}>
               <Site appMode={appMode} storage={mockStorage} />
            </MemoryRouter>
         );
         
         const privacyTitle = screen.getByText(uiStrings.kAppPageCaption);
         expect(privacyTitle).toBeTruthy();
      });

      it('renders App component for /index.html path', () => {
         render(
            <MemoryRouter initialEntries={['/index.html']}>
               <Site appMode={appMode} storage={mockStorage} />
            </MemoryRouter>
         );
         
         const privacyTitle = screen.getByText(uiStrings.kAppPageCaption);
         expect(privacyTitle).toBeTruthy();
      });

      it('renders PlainText component for /privacy path', () => {
         render(
            <MemoryRouter initialEntries={['/privacy']}>
               <Site appMode={appMode} storage={mockStorage} />
            </MemoryRouter>
         );
         
         const privacyTitle = screen.getByText(uiStrings.kPrivacyTitle);
         expect(privacyTitle).toBeTruthy();
      });

      it('renders PlainText component for /privacy.html path', () => {
         render(
            <MemoryRouter initialEntries={['/privacy.html']}>
               <Site appMode={appMode} storage={mockStorage} />
            </MemoryRouter>
         );
         
         const privacyTitle = screen.getByText(uiStrings.kPrivacyTitle);
         expect(privacyTitle).toBeTruthy();
      });

      it('renders PlainText component for /terms path', () => {
         render(
            <MemoryRouter initialEntries={['/terms']}>
               <Site appMode={appMode} storage={mockStorage} />
            </MemoryRouter>
         );
         
         const termsTitle = screen.getByText(uiStrings.kTermsTitle);
         expect(termsTitle).toBeTruthy();
      });

      it('renders PlainText component for /terms.html path', () => {
         render(
            <MemoryRouter initialEntries={['/terms.html']}>
               <Site appMode={appMode} storage={mockStorage} />
            </MemoryRouter>
         );
         
         const termsTitle = screen.getByText(uiStrings.kTermsTitle);
         expect(termsTitle).toBeTruthy();
      });

      it('handles unknown routes gracefully', () => {
         render(
            <MemoryRouter initialEntries={['/unknown']}>
               <Site appMode={appMode} storage={mockStorage} />
            </MemoryRouter>
         );

         // Should default to App component for unknown routes
         const privacyTitle = screen.getByText(uiStrings.kAppPageCaption);
         expect(privacyTitle).toBeTruthy();
      });
   });
}