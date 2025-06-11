/**
 * TermsSite.test.tsx
 * 
 * Unit tests for the TermsSite component using Mocha and expect.
 * Tests rendering and content display of the terms of service page.
 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen } from '@testing-library/react';
import { TermsSite } from '../src/TermsSite';
import { expect } from 'expect';
import { getCommonUIStrings } from '../src/UIStrings';
import { MockStorage } from './MockStorage';
import { UserProvider } from '../src/UserContext';

describe('TermsSite Component', () => {
   let mockStorage: MockStorage;
   const uiStrings = getCommonUIStrings();

   beforeEach(() => {
      mockStorage = new MockStorage();
   });

   afterEach(() => {
      mockStorage.clear();
   });

   const renderTermsSite = () => {
      return render(
         <UserProvider storage={mockStorage}>
            <TermsSite />
         </UserProvider>
      );
   };

   it('renders without crashing', () => {
      const { container } = renderTermsSite();
      expect(container).toBeTruthy();
   });

   it('renders the terms of service title', () => {
      renderTermsSite();

      const title = screen.getByText(uiStrings.kTermsTitle);
      expect(title).toBeTruthy();
   });

   it('renders the terms of service content', () => {
      renderTermsSite();

      // Check for some key sections of the terms of service
      expect(screen.getByText(/1\.\s*Introduction/)).toBeTruthy();
      expect(screen.getByText(/2\.\s*General usage rules/)).toBeTruthy();
      expect(screen.getByText(/3\.\s*Unlawful Content/)).toBeTruthy();
   });

   it('renders the footer with correct site type', () => {
      renderTermsSite();

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
      renderTermsSite();

      const copyright = screen.getByText(/© 2025 Strong AI Technologies Ltd/);
      expect(copyright).toBeTruthy();
   });
}); 