import React from 'react';
import { describe, it } from 'mocha';
import { expect } from 'expect';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer, Spacer } from '../src/SiteUtilities';
import { getUIStrings } from '../src/UIStrings';
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';
import { UserProvider } from '../src/UserContext';
import { MockStorage } from './MockStorage';

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
        const uiStrings = getUIStrings(EAssistantPersonality.kTheYardAssistant);
        let mockStorage: MockStorage;

        beforeEach(() => {
            mockStorage = new MockStorage();
        });

        afterEach(() => {
            mockStorage.clear();
        });

        const renderFooter = () => {
            return render(
                <UserProvider storage={mockStorage}>
                    <BrowserRouter>
                        <Footer />
                    </BrowserRouter>
                </UserProvider>
            );
        };

        it('should render all navigation links', () => {
            renderFooter();
            
            const homeLink = screen.getByText(uiStrings.kChat);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);
            const aboutLink = screen.getByText(uiStrings.kAbout);

            expect(homeLink).toBeTruthy();
            expect(privacyLink).toBeTruthy();
            expect(termsLink).toBeTruthy();
            expect(aboutLink).toBeTruthy();
        });

        it('should have correct href attributes for links', () => {
            renderFooter();
            
            const homeLink = screen.getByText(uiStrings.kChat);
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

            expect(homeLink.getAttribute('href')).toBe('/');
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

            expect(homeLink.getAttribute('href')).toBe('/');
            expect(privacyLink.getAttribute('href')).toBe('/privacy');
            expect(termsLink.getAttribute('href')).toBe('/terms');
            expect(aboutLink.getAttribute('href')).toBe('/about');
        });
    });
}); 