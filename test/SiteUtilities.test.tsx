import React from 'react';
import { describe, it } from 'mocha';
import { expect } from 'expect';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer, Spacer } from '../src/SiteUtilities';
import { EAppMode, getUIStrings } from '../src/UIStrings';

describe('SiteUtilities', () => {
    describe('Spacer', () => {
        it('should render a div with non-breaking spaces', () => {
            const { container } = render(<Spacer />);
            const spacer = container.firstChild as HTMLElement;
            expect(spacer.tagName).toBe('DIV');
            expect(spacer.innerHTML).toBe('&nbsp;&nbsp;&nbsp;');
        });
    });

    describe('Footer', () => {
        const uiStrings = getUIStrings(EAppMode.kYardTalk);

        const renderFooter = () => {
            return render(
                <BrowserRouter>
                    <Footer />
                </BrowserRouter>
            );
        };

        it('should render all navigation links', () => {
            renderFooter();
            
            const homeLink = screen.getByText(uiStrings.kHome);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);

            expect(homeLink).toBeTruthy();
            expect(privacyLink).toBeTruthy();
            expect(termsLink).toBeTruthy();
        });

        it('should have correct href attributes for links', () => {
            renderFooter();
            
            const homeLink = screen.getByText(uiStrings.kHome);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);

            expect(homeLink.getAttribute('href')).toBe('/index');
            expect(privacyLink.getAttribute('href')).toBe('/privacy');
            expect(termsLink.getAttribute('href')).toBe('/terms');
        });

        it('should apply mobile styles when window width is below breakpoint', () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 767 // Below MOBILE_BREAKPOINT
            });

            const { container } = renderFooter();

            const homeLink = screen.getByText(uiStrings.kHome);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);

            expect(homeLink.getAttribute('href')).toBe('/index');
            expect(privacyLink.getAttribute('href')).toBe('/privacy');
            expect(termsLink.getAttribute('href')).toBe('/terms');
        });

        it('should apply desktop styles when window width is above breakpoint', () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 769 // Above MOBILE_BREAKPOINT
            });

            const { container } = renderFooter();
            
            const homeLink = screen.getByText(uiStrings.kHome);
            const privacyLink = screen.getByText(uiStrings.kPrivacy);
            const termsLink = screen.getByText(uiStrings.kTerms);

            expect(homeLink.getAttribute('href')).toBe('/index');
            expect(privacyLink.getAttribute('href')).toBe('/privacy');
            expect(termsLink.getAttribute('href')).toBe('/terms');
        });
    });
}); 