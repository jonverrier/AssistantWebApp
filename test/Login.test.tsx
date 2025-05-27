/**
 * Login.test.tsx
 * 
 * Test suite for the Login component.
 * Currently testing the placeholder implementation before Google login integration.
 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import expect from 'expect';
import { Login } from '../src/Login';
import { EAppMode } from '../src/UIStrings';
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { BrowserRouter } from 'react-router-dom';
import * as SessionCall from '../src/SessionCall';
import * as MultilineEditModule from '../src/MultilineEdit';
import sinon from 'sinon';
import { MockStorage } from './MockStorage';

describe('Login Component', () => {
   // Store original MultilineEdit implementation
   const originalMultilineEdit = MultilineEditModule.MultilineEdit;
   let mockStorage: MockStorage;

   beforeEach(() => {
      // Reset all mocks before each test
      sinon.restore();
      mockStorage = new MockStorage();

      // Mock MultilineEdit component for Login tests
      const MockMultilineEdit = () => <div data-testid="mock-multiline-edit">Mocked MultilineEdit</div>;
      Object.defineProperty(MultilineEditModule, 'MultilineEdit', { 
         value: MockMultilineEdit,
         configurable: true 
      });
   });

   afterEach(() => {
      // Restore original MultilineEdit implementation
      Object.defineProperty(MultilineEditModule, 'MultilineEdit', { 
         value: originalMultilineEdit,
         configurable: true 
      });
      mockStorage.clear();
   });

   const renderLogin = () => {
      return render(
         <FluentProvider theme={teamsDarkTheme}>
            <BrowserRouter>
               <Login appMode={EAppMode.kYardTalk} storage={mockStorage} />
            </BrowserRouter>
         </FluentProvider>
      );
   };

   it('should render without crashing', () => {
      renderLogin();
      // Verify some basic content is rendered
      expect(screen.getByTestId('login-container')).toBeTruthy();
   });

   it('should update session ID when getSessionUuid returns a value', async () => {
      // Mock getSessionUuid to return a specific session ID
      const mockSessionId = 'test-session-123';
      const getSessionUuidStub = sinon.stub(SessionCall, 'getSessionUuid').resolves(mockSessionId);

      // Set a user ID in storage to trigger session ID fetch
      mockStorage.set('motif_user_id', 'test-user-123');

      renderLogin();

      // Wait for the session ID to be updated
      await waitFor(() => {
         const container = screen.getByTestId('login-container');
         expect(container.getAttribute('data-session-id')).toBe(mockSessionId);
      }, { timeout: 2000 });

      // Verify getSessionUuid was called
      expect(getSessionUuidStub.called).toBeTruthy();
   });

   it('should use temporary session ID when getSessionUuid returns null', async () => {
      // Mock getSessionUuid to return null
      const getSessionUuidStub = sinon.stub(SessionCall, 'getSessionUuid').resolves(undefined);

      // Set a user ID in storage to trigger session ID fetch
      mockStorage.set('motif_user_id', 'test-user-123');

      renderLogin();

      // Wait for the session ID to be updated
      await waitFor(() => {
         const container = screen.getByTestId('login-container');
         const sessionId = container.getAttribute('data-session-id');
         expect(sessionId).toMatch(/^session-\d+$/);
      }, { timeout: 2000 });

      // Verify getSessionUuid was called
      expect(getSessionUuidStub.called).toBeTruthy();
   });
}); 