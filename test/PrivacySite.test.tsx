/**
 * PrivacySite.test.tsx
 * 
 * Unit tests for the PrivacySite component using Mocha and expect.
 * Tests rendering and content display of the privacy policy page.
 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PrivacySite } from '../src/PrivacySite';
import { expect } from 'expect';
import { getCommonUIStrings } from '../src/UIStrings';
import { MockStorage } from './MockStorage';
import { UserProvider } from '../src/UserContext';

describe('PrivacySite Component', () => {
   let mockStorage: MockStorage;
   const uiStrings = getCommonUIStrings();

   beforeEach(() => {
      mockStorage = new MockStorage();
   });

   afterEach(() => {
      mockStorage.clear();
   });

   const renderPrivacySite = () => {
      return render(
         <UserProvider storage={mockStorage}>
            <PrivacySite />
         </UserProvider>
      );
   };

   it('renders without crashing', () => {
      const { container } = renderPrivacySite();
      expect(container).toBeTruthy();
   });

   it('renders the privacy policy title', () => {
      renderPrivacySite();

      const title = screen.getByText(uiStrings.kPrivacyTitle);
      expect(title).toBeTruthy();
   });

   it('renders the privacy policy content', () => {
      renderPrivacySite();

      // Check for some key sections of the privacy policy
      expect(screen.getByText(/1\. Introduction/)).toBeTruthy();
      expect(screen.getByText(/2\. The personal data that we collect/)).toBeTruthy();
      expect(screen.getByText(/3\. Purposes of processing and legal bases/)).toBeTruthy();
   });

   it('renders the footer with correct site type', () => {
      renderPrivacySite();

      // Check that the footer links are present
      expect(screen.getByText(uiStrings.kHome)).toBeTruthy();
      expect(screen.getByText(uiStrings.kPrivacy)).toBeTruthy();
      expect(screen.getByText(uiStrings.kTerms)).toBeTruthy();
      expect(screen.getByText(uiStrings.kAbout)).toBeTruthy();

      // Verify the home link points to the root
      const homeLink = screen.getByText(uiStrings.kHome);
      expect(homeLink.getAttribute('href')).toBe('/');
   });

   it('renders the copyright notice', () => {
      renderPrivacySite();

      const copyright = screen.getByText(/© 2025 Strong AI Technologies Ltd/);
      expect(copyright).toBeTruthy();
   });
}); 