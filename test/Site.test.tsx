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
import { getUIStrings } from '../src/UIStrings';
import { MockStorage } from './MockStorage';
import { UserProvider } from '../src/UserContext';
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';

describe(`RoutedSite Component`, () => {
   let mockStorage: MockStorage;

   beforeEach(() => {
      mockStorage = new MockStorage();
   });

   afterEach(() => {
      mockStorage.clear();
   });

   it('renders without crashing', () => {
      const { container } = render(
         <UserProvider storage={mockStorage}>
            <RoutedSite />
         </UserProvider>
      );
      expect(container).toBeTruthy();
   });
});


describe(`Site Component`, () => {
   const uiStrings = getUIStrings(EAssistantPersonality.kTheYardAssistant);
   let mockStorage: MockStorage;

   beforeEach(() => {
      mockStorage = new MockStorage();
   });

   afterEach(() => {
      mockStorage.clear();
   });

   it('renders Home component with launch button for root path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/']}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const title = screen.getByText(uiStrings.kAboutTitle);
      const launchButton = screen.getByText(/The Yard, Peckham/i);
      expect(title).toBeTruthy();
      expect(launchButton).toBeTruthy();
   });

   it('renders About component with content but no launch button', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/about']}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const title = screen.getByText(uiStrings.kAboutTitle);
      const content = screen.getByText(/CrossFit works/i);
      expect(title).toBeTruthy();
      expect(content).toBeTruthy();
      expect(screen.queryByText(/The Yard, Peckham/i)).toBeNull();
   });

   it('renders About component for /about.html path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/about.html']}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const title = screen.getByText(uiStrings.kAboutTitle);
      const content = screen.getByText(/CrossFit works/i);
      expect(title).toBeTruthy();
      expect(content).toBeTruthy();
      expect(screen.queryByText(/The Yard, Peckham/i)).toBeNull();
   });

   it('renders PlainText component for /privacy path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/privacy']}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const privacyTitle = screen.getByText(uiStrings.kPrivacyTitle);
      expect(privacyTitle).toBeTruthy();
   });

   it('renders PlainText component for /privacy.html path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/privacy.html']}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const privacyTitle = screen.getByText(uiStrings.kPrivacyTitle);
      expect(privacyTitle).toBeTruthy();
   });

   it('renders PlainText component for /terms path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/terms']}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const termsTitle = screen.getByText(uiStrings.kTermsTitle);
      expect(termsTitle).toBeTruthy();
   });

   it('renders PlainText component for /terms.html path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/terms.html']}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const termsTitle = screen.getByText(uiStrings.kTermsTitle);
      expect(termsTitle).toBeTruthy();
   });

   it('handles unknown routes gracefully', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/unknown']}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      // Should redirect to home page with launch button
      const title = screen.getByText(uiStrings.kAboutTitle);
      const launchButton = screen.getByText(/The Yard, Peckham/i);
      expect(title).toBeTruthy();
      expect(launchButton).toBeTruthy();
   });
});
