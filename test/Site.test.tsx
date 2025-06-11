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
import { getCommonUIStrings } from '../src/UIStrings';
import { MockStorage } from './MockStorage';
import { UserProvider } from '../src/UserContext';

describe(`RoutedSite Component`, () => {
   let mockStorage: MockStorage;

   beforeEach(() => {
      mockStorage = new MockStorage();
      // Mock window.scrollTo
      window.scrollTo = () => {};
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
   const uiStrings = getCommonUIStrings();
   let mockStorage: MockStorage;

   beforeEach(() => {
      mockStorage = new MockStorage();
      // Mock window.scrollTo
      window.scrollTo = () => {};
   });

   afterEach(() => {
      mockStorage.clear();
   });

   it('renders Home component with launch button for root path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/']} future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
            }}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const title = screen.getByText(uiStrings.kHomeTitle);
      const strapline = screen.getByText(uiStrings.kHomeStrapline);
      expect(title).toBeTruthy();
      expect(strapline).toBeTruthy();
   });

   it('renders About component with content but no launch button', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/about']} future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
            }}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const title = screen.getByText(uiStrings.kAboutTitle);
      const strapline = screen.getByText(uiStrings.kAboutStrapline);
      expect(title).toBeTruthy();
      expect(strapline).toBeTruthy();
   });

   it('renders About component for /about.html path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/about.html']} future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
            }}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      const title = screen.getByText(uiStrings.kAboutTitle);
      const strapline = screen.getByText(uiStrings.kAboutStrapline);
      expect(title).toBeTruthy();
      expect(strapline).toBeTruthy();
   });
   
   it('renders PlainText component for /terms path', () => {
      render(
         <UserProvider storage={mockStorage}>
            <MemoryRouter initialEntries={['/terms']} future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
            }}>
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
            <MemoryRouter initialEntries={['/terms.html']} future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
            }}>
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
            <MemoryRouter initialEntries={['/unknown']} future={{
               v7_startTransition: true,
               v7_relativeSplatPath: true
            }}>
               <Site />
            </MemoryRouter>
         </UserProvider>
      );

      // Should redirect to home page
      const title = screen.getByText(uiStrings.kHomeTitle);
      const strapline = screen.getByText(uiStrings.kHomeStrapline);
      expect(title).toBeTruthy();
      expect(strapline).toBeTruthy();
   });
});

