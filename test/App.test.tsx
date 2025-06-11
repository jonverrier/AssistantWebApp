/**
 * App.test.tsx
 * 
 * Unit tests for the main App component, testing rendering and basic functionality.
 */

import { expect } from "expect";
import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import sinon from 'sinon';

import { App } from "../src/App";
import { getUIStrings } from "../src/UIStrings";
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import { EAssistantPersonality } from "../import/AssistantChatApiTypes";
import { UserProvider } from '../src/UserContext';
import { MockStorage } from './MockStorage';

// Test user data
const TEST_USER = {
   email: 'test@example.com',
   sessionId: 'test-session-' + Date.now().toString()
};

// Mock the focus behavior for tests
const mockFocus = () => { };

// Stub for onLogout
const stubOnLogout = async () => { };

// Helper function to render App component with Router context
const renderWithRouter = (component: React.ReactNode) => {
   const mockStorage = new MockStorage();
   return render(
      <BrowserRouter future={{
         v7_startTransition: true,
         v7_relativeSplatPath: true
      }}>
         <FluentProvider theme={teamsDarkTheme}>
            <UserProvider storage={mockStorage}>
               {component}
            </UserProvider>
         </FluentProvider>
      </BrowserRouter>
   );
};

describe('App Component', () => {
   const uiStrings = getUIStrings(EAssistantPersonality.kTheYardAssistant);
   const sandbox = sinon.createSandbox();

   beforeEach(() => {
      // Mock scrollIntoView since it's not implemented in JSDOM
      if (window.Element) {
         window.Element.prototype.scrollIntoView = function () { };
      }

      // Save original focus
      const originalFocus = window.HTMLElement.prototype.focus;

      // Replace focus with mock
      Object.defineProperty(window.HTMLElement.prototype, 'focus', {
         value: mockFocus,
         writable: true
      });

      // Mock processChat using Sinon
      const chatModule = require('../src/ChatCall');
      sandbox.stub(chatModule, 'processChat').callsFake(function (this: any, params: any) {
         setTimeout(() => {
            params.onChunk("Here's a test response");
            params.onComplete();
         }, 100);
         return Promise.resolve("Here's a test response");
      });

      return () => {
         // Restore original focus
         Object.defineProperty(window.HTMLElement.prototype, 'focus', {
            value: originalFocus,
            writable: true
         });
      };
   });

   afterEach(() => {
      cleanup();
      sandbox.restore();

      // Clean up scrollIntoView
      if (window.Element) {
         // @ts-ignore
         delete window.Element.prototype.scrollIntoView;
      }
   });

   it('should render the main heading and description', async () => {
      renderWithRouter(
         <App
            personality={EAssistantPersonality.kTheYardAssistant}
            email={TEST_USER.email}
            sessionId={TEST_USER.sessionId}
            onLogout={stubOnLogout}
         />
      );

      // Check for main heading
      await waitFor(() => {
         expect(screen.getByText(uiStrings.kAppPageCaption, { exact: true })).toBeTruthy();
      });

      // Check for description text
      await waitFor(() => {
         expect(screen.getByText(uiStrings.kAppPageStrapline, { exact: true })).toBeTruthy();
      });
   });

   it('should render the text input area', () => {
      renderWithRouter(
         <App
            personality={EAssistantPersonality.kTheYardAssistant}
            email={TEST_USER.email}
            sessionId={TEST_USER.sessionId}
            onLogout={stubOnLogout}
         />
      );

      // Check for the text input area
      const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder);
      expect(textarea).toBeTruthy();
   });

   it('should render external links', () => {
      renderWithRouter(
         <App
            personality={EAssistantPersonality.kTheYardAssistant}
            email={TEST_USER.email}
            sessionId={TEST_USER.sessionId}
            onLogout={stubOnLogout}
         />
      );

      const links = uiStrings.kLinks;

      // Skip test if no links defined
      if (!links || links.length === 0) {
         return;
      }

      // Check first link if links exist
      const firstLink = links.split(',')[0];
      const matches = firstLink.match(/\[(.*?)\]\((.*?)\)/);
      const [_1, linkText, linkUrl] = matches || [];

      const link = screen.getByText(linkText);
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toContain(linkUrl);
   });

   it('should handle text input changes', () => {
      renderWithRouter(
         <App
            personality={EAssistantPersonality.kTheYardAssistant}
            email={TEST_USER.email}
            sessionId={TEST_USER.sessionId}
            onLogout={stubOnLogout}
         />
      );

      const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test requirement' } });

      expect(textarea.value).toBe('Test requirement');
   });

   const kResponseTimeout = 20000; // 20 seconds total timeout
   const kResponseCheckInterval = 1000; // Check every second

   it('should update chat history when chatting', async function () {
      this.timeout(25000); // Set test timeout to 25 seconds

      renderWithRouter(
         <App
            personality={EAssistantPersonality.kTheYardAssistant}
            email={TEST_USER.email}
            sessionId={TEST_USER.sessionId}
            onLogout={stubOnLogout}
         />
      );

      // Get the textarea through the MultilineEdit component
      const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder) as HTMLTextAreaElement;

      const testMessage = 'I want a 200kg deadlift';

      // First set the value
      await act(async () => {
         fireEvent.change(textarea, {
            target: { value: testMessage },
            currentTarget: { value: testMessage }
         });
      });

      // Then trigger the Ctrl+Enter and wait for the API call to complete
      await act(async () => {
         fireEvent.keyDown(textarea, {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
            currentTarget: {
               value: testMessage
            }
         });
      });

      // First wait for the user message to appear
      await waitFor(
         () => {
            expect(screen.getByText(testMessage)).toBeTruthy();
         },
         {
            timeout: kResponseTimeout / 2,
            interval: kResponseCheckInterval
         }
      );

      // Then wait for the assistant response
      await waitFor(
         () => {
            expect(screen.getByText("Here's a test response")).toBeTruthy();
         },
         {
            timeout: kResponseTimeout / 2,
            interval: kResponseCheckInterval
         }
      );
   });
});
