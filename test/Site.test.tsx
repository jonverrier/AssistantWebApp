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

let appModes = [EAppMode.kYardTalk];

for (let appMode of appModes) {
   describe(`RoutedSite Component for ${appMode}`, () => {
      it('renders without crashing', () => {
         const { container } = render(
            <RoutedSite appMode={appMode} />
        );
         expect(container).toBeTruthy();
      });
   });
}

for (let appMode of appModes) {
   describe(`Site Component for ${appMode}`, () => {
      const uiStrings = getUIStrings(appMode);
      
    it('renders App component for root path', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Site appMode={appMode} />
            </MemoryRouter>
        );
        
        // Since App is rendered, we should see its content
        const privacyTitle = screen.getByText(uiStrings.kAppPageCaption);
        expect(privacyTitle).toBeTruthy();
    });

    it('renders App component for /index path', () => {
        render(
            <MemoryRouter initialEntries={['/index']}>
                <Site appMode={appMode} />
            </MemoryRouter>
        );
        
        const privacyTitle = screen.getByText(uiStrings.kAppPageCaption);
        expect(privacyTitle).toBeTruthy();
    });

    it('renders App component for /index.html path', () => {
        render(
            <MemoryRouter initialEntries={['/index.html']}>
                <Site appMode={appMode} />
            </MemoryRouter>
        );
        
        const privacyTitle = screen.getByText(uiStrings.kAppPageCaption);
        expect(privacyTitle).toBeTruthy();
    });

    it('renders PlainText component for /privacy path', () => {
        render(
            <MemoryRouter initialEntries={['/privacy']}>
                <Site appMode={appMode} />
            </MemoryRouter>
        );
        
        const privacyTitle = screen.getByText(uiStrings.kPrivacyTitle);
        expect(privacyTitle).toBeTruthy();
    });

    it('renders PlainText component for /privacy.html path', () => {
        render(
            <MemoryRouter initialEntries={['/privacy.html']}>
                <Site appMode={appMode} />
            </MemoryRouter>
        );
        
        const privacyTitle = screen.getByText(uiStrings.kPrivacyTitle);
        expect(privacyTitle).toBeTruthy();
    });

    it('renders PlainText component for /terms path', () => {
        render(
            <MemoryRouter initialEntries={['/terms']}>
                <Site appMode={appMode} />
            </MemoryRouter>
        );
        
        const termsTitle = screen.getByText(uiStrings.kTermsTitle);
        expect(termsTitle).toBeTruthy();
    });

    it('renders PlainText component for /terms.html path', () => {
        render(
            <MemoryRouter initialEntries={['/terms.html']}>
                <Site appMode={appMode} />
            </MemoryRouter>
        );
        
        const termsTitle = screen.getByText(uiStrings.kTermsTitle);
        expect(termsTitle).toBeTruthy();
    });

    it('handles unknown routes gracefully', () => {
        render(
            <MemoryRouter initialEntries={['/unknown']}>
                <Site appMode={appMode} />
            </MemoryRouter>
        );

         // Should default to App component for unknown routes
         const privacyTitle = screen.getByText(uiStrings.kAppPageCaption);
         expect(privacyTitle).toBeTruthy();
      });
   });
}