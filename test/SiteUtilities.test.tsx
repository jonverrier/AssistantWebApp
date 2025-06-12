import React from 'react';
import { describe, it } from 'mocha';
import { expect } from 'expect';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer, Spacer, ESiteType } from '../src/SiteUtilities';
import { getCommonUIStrings } from '../src/UIStrings';
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';
import { UserProvider } from '../src/UserContext';
import { browserSessionStorage } from '../src/LocalStorage';
import { MockStorage } from './MockStorage';

const uiStrings = getCommonUIStrings();

// Mock the reCAPTCHA function
import * as captcha from '../src/captcha';
const mockExecuteReCaptcha = async () => 'mock-token';
const originalExecuteReCaptcha = captcha.executeReCaptcha;
Object.defineProperty(captcha, 'executeReCaptcha', {
   value: mockExecuteReCaptcha,
   writable: true
});

describe('SiteUtilities', () => {
    describe('Spacer', () => {
        it('should render a div with 14px height', () => {
            const { container } = render(<Spacer />);
            const spacer = container.firstChild as HTMLElement;
            expect(spacer.tagName).toBe('DIV');
            expect(spacer.style.height).toBe('14px');
        });
    });

    describe('Footer', () => {
        let mockStorage: MockStorage;

        beforeEach(() => {
            mockStorage = new MockStorage();
        });

        afterEach(() => {
            mockStorage.clear();
            // Restore original function
            Object.defineProperty(captcha, 'executeReCaptcha', {
                value: originalExecuteReCaptcha,
                writable: true
            });
        });

        const renderFooter = (props = { siteType: ESiteType.kMain }) => {
            return render(
                <UserProvider storage={mockStorage}>
                    <BrowserRouter future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true
                    }}>
                        <Footer {...props} />
                    </BrowserRouter>
                </UserProvider>
            );
        };

        it('should render all navigation links', () => {
            renderFooter();
            
            expect(screen.getByText(uiStrings.kHome)).toBeTruthy();
            expect(screen.getByText(uiStrings.kChat)).toBeTruthy();
            expect(screen.getByText(uiStrings.kPrivacy)).toBeTruthy();
            expect(screen.getByText(uiStrings.kTerms)).toBeTruthy();
            expect(screen.getByText(uiStrings.kAbout)).toBeTruthy();
        });

        it('should have correct href attributes for links', () => {
            renderFooter();
            
            const homeLink = screen.getByText(uiStrings.kChat);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);
            const aboutLink = screen.getByText(uiStrings.kAbout);

            expect(homeLink.getAttribute('href')).toBe('/chat');
            expect(privacyLink.getAttribute('href')).toBe('/privacy');
            expect(termsLink.getAttribute('href')).toBe('/terms');
            expect(aboutLink.getAttribute('href')).toBe('/about');
        });

        it('should have correct href attributes for links when siteType is privacy', () => {
            renderFooter({ siteType: ESiteType.kPrivacy });
            
            const homeLink = screen.getByText(uiStrings.kHome);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);
            const aboutLink = screen.getByText(uiStrings.kAbout);

            expect(homeLink.getAttribute('href')).toBe('/');
            expect(privacyLink.getAttribute('href')).toBe('/privacy');
            expect(termsLink.getAttribute('href')).toBe('/terms');
            expect(aboutLink.getAttribute('href')).toBe('/about');
        });

        it('should apply mobile styles when window width is below breakpoint', () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 767 // Below MOBILE_BREAKPOINT
            });

            const { container } = renderFooter();

            const homeLink = screen.getByText(uiStrings.kChat);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);
            const aboutLink = screen.getByText(uiStrings.kAbout);

            expect(homeLink.getAttribute('href')).toBe('/chat');
            expect(privacyLink.getAttribute('href')).toBe('/privacy');
            expect(termsLink.getAttribute('href')).toBe('/terms');
            expect(aboutLink.getAttribute('href')).toBe('/about');
        });

        it('should apply desktop styles when window width is above breakpoint', () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 769 // Above MOBILE_BREAKPOINT
            });

            const { container } = renderFooter();
            
            const homeLink = screen.getByText(uiStrings.kChat);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);
            const aboutLink = screen.getByText(uiStrings.kAbout);

            expect(homeLink.getAttribute('href')).toBe('/chat');
            expect(privacyLink.getAttribute('href')).toBe('/privacy');
            expect(termsLink.getAttribute('href')).toBe('/terms');
            expect(aboutLink.getAttribute('href')).toBe('/about');
        });
    });
}); 