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
import { EAssistantPersonality, EUserRole } from '../import/AssistantChatApiTypes';
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { BrowserRouter } from 'react-router-dom';
import * as SessionCall from '../src/SessionCall';
import * as MultilineEditModule from '../src/MultilineEdit';
import * as CaptchaModule from '../src/captcha';
import sinon from 'sinon';
import { MockStorage } from './MockStorage';
import { UIStrings } from '../src/UIStrings';
import { RECAPTCHA_THRESHOLD } from '../src/captcha';
import { UserProvider } from '../src/UserContext';

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
      // Clean up window properties
      delete (window as any).onGoogleLogin;
      delete (window as any).google;
   });

   // Helper function for security-related tests
   const testSecurityScenario = async (score: number, expectedMessage: string, timeout: number = 5000) => {
      // Mock reCAPTCHA with the specified score
      const mockExecuteReCaptcha = sinon.stub().resolves({ 
         success: score >= RECAPTCHA_THRESHOLD,
         score 
      });
      Object.defineProperty(CaptchaModule, 'executeReCaptcha', {
         value: mockExecuteReCaptcha,
         configurable: true
      });

      // Create a mock JWT token that will decode to our test user
      const mockDecodedToken = {
         sub: 'test-user-456',
         name: 'Test User'
      };
      const mockJwt = `header.${btoa(JSON.stringify(mockDecodedToken))}.signature`;
      
      // Set up window.onGoogleLogin before rendering
      (window as any).onGoogleLogin = undefined;

      // Render login which will set up Google Sign-In
      renderLogin();

      // Wait for window.onGoogleLogin to be set up
      await waitFor(() => {
         return typeof window.onGoogleLogin === 'function';
      });

      // Simulate Google Sign-In callback
      (window.onGoogleLogin as (response: { credential: string }) => void)({ credential: mockJwt });

      // Verify that the expected message appears
      await waitFor(() => {
         const errorMessage = screen.getByText(expectedMessage);
         expect(errorMessage).toBeTruthy();
      }, { 
         timeout,
         interval: 100
      });

      // Verify reCAPTCHA was called
      expect(mockExecuteReCaptcha.called).toBeTruthy();
   };

   // Wrapper component for testing
   const LoginWrapper = () => {
      return (
         <FluentProvider theme={teamsDarkTheme}>
            <UserProvider storage={mockStorage}>
               <BrowserRouter>
                  <Login personality={EAssistantPersonality.kTheYardAssistant} />
               </BrowserRouter>
            </UserProvider>
         </FluentProvider>
      );
   };

   const renderLogin = () => {
      return render(<LoginWrapper />);
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
      const mockSessionData = { sessionId: mockSessionId, role: EUserRole.kGuest };
      const getSessionUuidStub = sinon.stub(SessionCall, 'getSessionData').resolves(mockSessionData);

      // Create a mock JWT token that will decode to our test user
      const mockDecodedToken = {
         sub: 'test-user-123',
         name: 'Test User'
      };
      const mockJwt = `header.${btoa(JSON.stringify(mockDecodedToken))}.signature`;

      renderLogin();

      // Wait for window.onGoogleLogin to be set up
      await waitFor(() => {
         return typeof window.onGoogleLogin === 'function';
      });

      // Simulate Google Sign-In callback
      (window.onGoogleLogin as (response: { credential: string }) => void)({ credential: mockJwt });

      // Wait for the session ID to be updated
      await waitFor(() => {
         const container = screen.getByTestId('login-container');
         expect(container).toBeTruthy();
         expect(container.getAttribute('data-session-id')).toBe(mockSessionId);
      }, { timeout: 2000 });

      // Verify getSessionUuid was called
      expect(getSessionUuidStub.called).toBeTruthy();
   });

   it('should use temporary session ID when getSessionUuid returns null', async function() {
      this.timeout(10000); // Increase timeout to 10 seconds
      
      // Mock getSessionUuid to return undefined
      const getSessionUuidStub = sinon.stub(SessionCall, 'getSessionData').resolves(undefined);

      // Create a mock JWT token that will decode to our test user
      const mockDecodedToken = {
         sub: 'test-user-123',
         name: 'Test User',
         email: 'test@example.com'
      };
      const mockJwt = `header.${btoa(JSON.stringify(mockDecodedToken))}.signature`;

      renderLogin();

      // Wait for window.onGoogleLogin to be set up
      await waitFor(() => {
         return typeof window.onGoogleLogin === 'function';
      });

      // Simulate Google Sign-In callback
      (window.onGoogleLogin as (response: { credential: string }) => void)({ credential: mockJwt });

      // Wait for the session ID to be updated with a temporary UUID
      await waitFor(() => {
         const container = screen.getByTestId('login-container');
         expect(container).toBeTruthy();
         const sessionId = container.getAttribute('data-session-id');
         expect(sessionId).not.toBeNull();
         expect(sessionId).not.toBeUndefined();
         // Check that the session ID is a valid UUID
         expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      }, { timeout: 5000 });

      // Verify getSessionUuid was called
      expect(getSessionUuidStub.called).toBeTruthy();
   });

   it('should handle low captcha scores appropriately', async function() {
      this.timeout(10000); // Set higher Mocha timeout
      await testSecurityScenario(0.2, UIStrings.kLoginBlocked, 5000);
   });

   it('should require additional verification for moderate-low captcha scores', async function() {
      this.timeout(10000);
      await testSecurityScenario(0.35, UIStrings.kAdditionalVerification, 5000);
   });

   it('should apply rate limiting for moderate captcha scores', async function() {
      this.timeout(10000);
      await testSecurityScenario(0.45, UIStrings.kTooManyAttempts, 5000);
   });

   it('should allow login with high captcha scores', async function() {
      this.timeout(10000);
      
      // Mock getSessionUuid to return a session ID
      const mockSessionId = 'test-session-456';
      const mockSessionData = { sessionId: mockSessionId, role: EUserRole.kGuest };
      const getSessionUuidStub = sinon.stub(SessionCall, 'getSessionData').resolves(mockSessionData);

      // Mock reCAPTCHA with a high score
      const mockExecuteReCaptcha = sinon.stub().resolves({ 
         success: true, 
         score: 0.9 
      });
      Object.defineProperty(CaptchaModule, 'executeReCaptcha', {
         value: mockExecuteReCaptcha,
         configurable: true
      });

      // Create a mock JWT token that will decode to our test user
      const mockDecodedToken = {
         sub: 'test-user-101',
         name: 'Test User',
         email: 'test@example.com'
      };
      const mockJwt = `header.${btoa(JSON.stringify(mockDecodedToken))}.signature`;
      
      // Set up window.onGoogleLogin before rendering
      (window as any).onGoogleLogin = undefined;

      // Render login which will set up Google Sign-In
      renderLogin();

      // Wait for window.onGoogleLogin to be set up
      await waitFor(() => {
         return typeof window.onGoogleLogin === 'function';
      });

      // Simulate Google Sign-In callback
      (window.onGoogleLogin as (response: { credential: string }) => void)({ credential: mockJwt });

      // Wait for successful login - check that session ID is set and no error is shown
      await waitFor(() => {
         const container = screen.getByTestId('login-container');
         expect(container).toBeTruthy();
         expect(container.getAttribute('data-session-id')).toBe(mockSessionId);
         
         // Verify no error message is shown
         const errorElements = screen.queryByText(UIStrings.kLoginBlocked);
         expect(errorElements).toBeNull();
      }, { timeout: 5000 });

      // Verify reCAPTCHA and getSessionUuid were called
      expect(mockExecuteReCaptcha.called).toBeTruthy();
      expect(getSessionUuidStub.called).toBeTruthy();
   });
   
}); 