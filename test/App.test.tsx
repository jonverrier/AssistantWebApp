/**
 * App.test.tsx
 * 
 * Unit tests for the main App component, testing rendering and basic functionality.
 */

import { expect } from "expect";
import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";

import { App } from "../src/App";
import { EAppMode, getUIStrings, IUIStrings } from "../src/UIStrings";

// Helper function to render App component with Router context
const renderWithRouter = (component: React.ReactNode) => {
   return render(
      <BrowserRouter>
         {component}
      </BrowserRouter>
   );
};

let appModes = [EAppMode.kYardTalk];

for (let appMode of appModes) {
   describe('App Component', () => {
      const uiStrings = getUIStrings(appMode);

      beforeEach(() => {
         // Mock scrollIntoView since it's not implemented in JSDOM
         Element.prototype.scrollIntoView = function() {};
      });

      afterEach(() => {
         cleanup();
         // Clean up the mock
         // @ts-ignore - TypeScript doesn't know we added this property
         delete Element.prototype.scrollIntoView;
      });

      it('should render the main heading and description', async () => {
         renderWithRouter(<App appMode={appMode} forceNode={true} />);

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
         renderWithRouter(<App appMode={appMode} forceNode={true} />);

         // Check for the text input area
         const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder);
         expect(textarea).toBeTruthy();
      });

      it('should render external links', () => {
         renderWithRouter(<App appMode={appMode} forceNode={true} />);

         // Check for first link link
         const links = uiStrings.kLinks;
         const firstLink = links.split(',')[0];
         const matches = firstLink.match(/\[(.*?)\]\((.*?)\)/);
         const [_1, linkText, linkUrl] = matches || [];

         const link = screen.getByText(linkText);
         expect(link).toBeTruthy();
         expect(link.getAttribute('href')).toContain(linkUrl);
      });

      it('should handle text input changes', () => {
         renderWithRouter(<App appMode={appMode} forceNode={true} />);

         const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder) as HTMLTextAreaElement;
         fireEvent.change(textarea, { target: { value: 'Test requirement' } });

         expect(textarea.value).toBe('Test requirement');
      });
      
      const kResponseTimeout = 10000; // 10 seconds total timeout
      const kResponseCheckInterval = 2000; // Check every two seconds
      const kTestTimeout = 12000; // Overall test timeout

      it('should update chat history when chatting', async () => {
         // Need to render with 'forceNode' so the Axios calls work in Mocha
         renderWithRouter(<App appMode={appMode} forceNode={true} />);

         // Get the textarea through the MultilineEdit component
         const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder) as HTMLTextAreaElement;
         
         // First set the value
         await act(async () => {
            fireEvent.change(textarea, { 
               target: { value: 'I want a 200kg deadlift' },
               currentTarget: { value: 'I want a 200kg deadlift' }
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
                  value: 'I want a 200kg deadlift'
               }
            });
         });

         // First wait for the user message to appear
         await waitFor(
            () => {
               expect(screen.getByText('I want a 200kg deadlift')).toBeTruthy();
            },
            {
               timeout: kResponseTimeout / 2,
               interval: kResponseCheckInterval
            }
         );

         // Then wait for both messages to be present
         await waitFor(
            () => {
               const messages = screen.getAllByRole('img');
               expect(messages).toHaveLength(2);
            },
            {
               timeout: kResponseTimeout,
               interval: kResponseCheckInterval,
               onTimeout: (error) => {
                  console.error('Timeout waiting for chat history update:', error);
                  throw error;
               }
            }
         );

      }).timeout(kTestTimeout);
   });
}