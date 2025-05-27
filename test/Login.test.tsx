/**
 * Login.test.tsx
 * 
 * Test suite for the Login component.
 * Currently testing the Google login integration, dont yet retrieve a list of facilities.
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
import * as CaptchaModule from '../src/captcha';
import sinon from 'sinon';
import { MockStorage } from './MockStorage';
import { UIStrings } from '../src/UIStrings';

describe('Login Component', () => {
   // Store original implementations
   const originalMultilineEdit = MultilineEditModule.MultilineEdit;
   const originalExecuteReCaptcha = CaptchaModule.executeReCaptcha;
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

      // Mock executeReCaptcha with a high score by default for successful cases
      const mockExecuteReCaptcha = sinon.stub().resolves({ success: true, score: 0.9 });
      Object.defineProperty(CaptchaModule, 'executeReCaptcha', {
         value: mockExecuteReCaptcha,
         configurable: true
      });
   });

   afterEach(() => {
      // Restore original implementations
      Object.defineProperty(MultilineEditModule, 'MultilineEdit', { 
         value: originalMultilineEdit,
         configurable: true 
      });
      Object.defineProperty(CaptchaModule, 'executeReCaptcha', {
         value: originalExecuteReCaptcha,
         configurable: true
      });
      mockStorage.clear();
   });

   const renderLogin = () => {
      return render(
         <FluentProvider theme={teamsDarkTheme}>
            <BrowserRouter>
               <Login appMode={EAppMode.kYardTalk} storage={mockStorage} forceNode={true} />
            </BrowserRouter>
         </FluentProvider>
      );
   };

   it('should render without crashing', () => {
      renderLogin();
      // Verify both container and view are rendered
      expect(screen.getByTestId('login-container')).toBeTruthy();
      expect(screen.getByTestId('login-view')).toBeTruthy();
   });

   it('should update session ID when getSessionUuid returns a value', async () => {
      // Mock getSessionUuid to return a specific session ID
      const mockSessionId = 'test-session-123';
      const getSessionUuidStub = sinon.stub(SessionCall, 'getSessionUuid').resolves(mockSessionId);

      // Set a user ID in storage to trigger session ID fetch
      mockStorage.set('motif_user_id', 'test-user-123');
      mockStorage.set('motif_user_name', 'test-user-123');

      renderLogin();

      // Wait for the session ID to be updated
      await waitFor(() => {
         const container = screen.getByTestId('login-container');
         expect(container).toBeTruthy();
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
      mockStorage.set('motif_user_name', 'test-user-123');

      renderLogin();

      // Wait for the session ID to be updated
      await waitFor(() => {
         const container = screen.getByTestId('login-container');
         expect(container).toBeTruthy();
         const sessionId = container.getAttribute('data-session-id');
         expect(sessionId).not.toBeNull();
         expect(sessionId).not.toBeUndefined();
         // Check that the session ID is a valid UUID
         expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      }, { timeout: 2000 });

      // Verify getSessionUuid was called
      expect(getSessionUuidStub.called).toBeTruthy();
   });

   // Helper function for security-related tests
   const testSecurityScenario = async (score: number, expectedMessage: string, timeout: number = 5000) => {
      // Override the default mock with the specified score
      const mockExecuteReCaptcha = sinon.stub().resolves({ success: false, score });
      Object.defineProperty(CaptchaModule, 'executeReCaptcha', {
         value: mockExecuteReCaptcha,
         configurable: true
      });

      // Mock Google response
      const mockCredential = 'mock.jwt.token';
      const mockDecodedToken = {
         sub: 'test-user-456',
         name: 'Test User'
      };
      global.atob = () => JSON.stringify(mockDecodedToken);

      // Set up window.google
      global.window.google = {
         accounts: {
            id: {
               initialize: sinon.stub(),
               renderButton: sinon.stub()
            }
         }
      };

      renderLogin();

      // Simulate Google login callback
      await window.onGoogleLogin({ credential: mockCredential });

      // Verify that the expected message appears
      await waitFor(() => {
         const errorMessage = screen.getByText(expectedMessage);
         expect(errorMessage).toBeTruthy();
      }, { 
         timeout,
         interval: 100
      });
   };

   it('should handle low captcha scores appropriately', async () => {
      await testSecurityScenario(0.2, UIStrings.kLoginBlocked);
   });

   it('should require additional verification for moderate-low captcha scores', async () => {
      await testSecurityScenario(0.35, UIStrings.kAdditionalVerification);
   }).timeout(6000);   

   it('should apply rate limiting for moderate captcha scores', async () => {
      await testSecurityScenario(0.45, UIStrings.kTooManyAttempts, 5000);
   }).timeout(6000);

   it('should allow login with high captcha scores', async () => {
      // Mock getSessionUuid to return a session ID
      const mockSessionId = 'test-session-456';
      sinon.stub(SessionCall, 'getSessionUuid').resolves(mockSessionId);

      // Mock Google response
      const mockCredential = 'mock.jwt.token';
      const mockDecodedToken = {
         sub: 'test-user-101',
         name: 'Test User'
      };
      global.atob = () => JSON.stringify(mockDecodedToken);

      // Set up window.google
      global.window.google = {
         accounts: {
            id: {
               initialize: sinon.stub(),
               renderButton: sinon.stub()
            }
         }
      };

      renderLogin();

      // Simulate Google login callback
      await window.onGoogleLogin({ credential: mockCredential });

      // Verify successful login
      await waitFor(() => {
         expect(mockStorage.get('motif_user_id')).toBe('test-user-101');
         expect(mockStorage.get('motif_user_name')).toBe('Test User');
         const container = screen.getByTestId('login-container');
         expect(container.getAttribute('data-session-id')).toBe(mockSessionId);
      });
   });
   
}); 