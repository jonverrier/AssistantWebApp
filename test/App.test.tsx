/**
 * App.test.tsx
 * 
 * Unit tests for the main App component, testing rendering and basic functionality.
 */

import { expect } from "expect";
import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { processChat } from '../src/ChatCall';
import sinon from 'sinon';

import { App } from "../src/App";
import { EAppMode, getUIStrings, IUIStrings } from "../src/UIStrings";
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';

// Test user data
const TEST_USER = {
   userName: 'TestUser',
   sessionId: 'test-session-' + Date.now().toString()
};

// Helper function to render App component with Router context
const renderWithRouter = (component: React.ReactNode) => {
   return render(
      <BrowserRouter>
         <FluentProvider theme={teamsDarkTheme}>
            {component}
         </FluentProvider>
      </BrowserRouter>
   );
};

let appModes = [EAppMode.kYardTalk];

for (let appMode of appModes) {
   describe('App Component', () => {
      const uiStrings = getUIStrings(appMode);
      const sandbox = sinon.createSandbox();

      beforeEach(() => {
         // Mock scrollIntoView since it's not implemented in JSDOM
         Element.prototype.scrollIntoView = function() {};
         
         // Mock processChat using Sinon instead of Jest
         const chatModule = require('../src/ChatCall');
         sandbox.stub(chatModule, 'processChat').callsFake(function(this: any, params: any) {
            setTimeout(() => {
               params.onChunk("Here's a test response");
               params.onComplete();
            }, 100);
            return Promise.resolve("Here's a test response");
         });
      });

      afterEach(() => {
         cleanup();
         // Clean up the mocks
         sandbox.restore();
         // @ts-ignore - TypeScript doesn't know we added this property
         delete Element.prototype.scrollIntoView;
      });

      it('should render the main heading and description', async () => {
         renderWithRouter(
            <App 
               appMode={appMode} 
               forceNode={true} 
               userName={TEST_USER.userName}
               sessionId={TEST_USER.sessionId}
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
               appMode={appMode} 
               forceNode={true} 
               userName={TEST_USER.userName}
               sessionId={TEST_USER.sessionId}
            />
         );

         // Check for the text input area
         const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder);
         expect(textarea).toBeTruthy();
      });

      it('should render external links', () => {
         renderWithRouter(
            <App 
               appMode={appMode} 
               forceNode={true} 
               userName={TEST_USER.userName}
               sessionId={TEST_USER.sessionId}
            />
         );

         const links = uiStrings.kLinks;
         
         // Skip test if no links defined
         if (!links || links.length === 0 ) {
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
               appMode={appMode} 
               forceNode={true} 
               userName={TEST_USER.userName}
               sessionId={TEST_USER.sessionId}
            />
         );

         const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder) as HTMLTextAreaElement;
         fireEvent.change(textarea, { target: { value: 'Test requirement' } });

         expect(textarea.value).toBe('Test requirement');
      });
      
      const kResponseTimeout = 20000; // 20 seconds total timeout
      const kResponseCheckInterval = 1000; // Check every second
      const kTestTimeout = 25000; // Overall test timeout

      it('should update chat history when chatting', async () => {
         // Need to render with 'forceNode' so the Axios calls work in Mocha
         renderWithRouter(
            <App 
               appMode={appMode} 
               forceNode={true} 
               userName={TEST_USER.userName}
               sessionId={TEST_USER.sessionId}
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
            async () => {
               // Look for both the user message and any response from the assistant
               const userMessage = screen.getByText(testMessage);
               expect(userMessage).toBeTruthy();
               
               // Wait for at least one message container that doesn't contain the user's message
               const messageContainers = screen.getAllByTestId('message-content');
               const assistantMessages = messageContainers.filter(container => 
                  !container.textContent?.includes(testMessage)
               );
               
               expect(assistantMessages.length).toBeGreaterThan(0);
            },
            {
               timeout: kResponseTimeout,
               interval: kResponseCheckInterval,
               onTimeout: (error) => {
                  console.error('Timeout waiting for assistant response:', error);
                  throw error;
               }
            }
         );
      }).timeout(kTestTimeout);
   });
}