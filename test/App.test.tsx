/**
 * App.test.tsx
 * 
 * Unit tests for the main App component, testing rendering and basic functionality.
 */

import { expect } from "expect";
import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";

import { App, activeFieldId } from "../src/App";
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

      afterEach(() => {
         cleanup();
      });

      it('should render the main heading and description', async () => {
         renderWithRouter(<App appMode={appMode} />);

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
         renderWithRouter(<App appMode={appMode} />);

         // Check for the text input area
         const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder);
         expect(textarea).toBeTruthy();
      });

      it('should render external links', () => {
         renderWithRouter(<App appMode={appMode} />);

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
         renderWithRouter(<App appMode={appMode} />);

         const textarea = screen.getByPlaceholderText(uiStrings.kChatPlaceholder) as HTMLTextAreaElement;
         fireEvent.change(textarea, { target: { value: 'Test requirement' } });

         expect(textarea.value).toBe('Test requirement');
      });
      
      const kResponseTimeout = 30000; // 30 seconds total timeout
      const kResponseCheckInterval = 1000; // Check every second
      const kTestTimeout = 35000; // Overall test timeout

      it('should show response when chatting', async () => {
         // Render the component
         const { rerender } = renderWithRouter(<App appMode={appMode} />);

         // Get the active field ID after we have rendered the component
         const targetId = activeFieldId + '-0';

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

         // Wait for the response with proper error handling
         await waitFor(
            () => {
               const responseElement = screen.getByTestId(targetId);

               if (responseElement) {
                  expect(responseElement).toBeTruthy();

                  const response = responseElement.textContent || '';
                  console.log('Current response:', response); // Debug log
                  const wordCount = response.trim().split(/\s+/).length;
                  expect(wordCount).toBeGreaterThanOrEqual(10);
               }
            },
            {
               timeout: kResponseTimeout,
               interval: kResponseCheckInterval,
               onTimeout: (error) => {
                  console.error('Timeout waiting for response:', error);
                  throw error;
               }
            }
         );
      }).timeout(kTestTimeout);
      
   });
}