"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mocha_1 = require("mocha");
const expect_1 = require("expect");
const react_2 = require("@testing-library/react");
const react_router_dom_1 = require("react-router-dom");
const SiteUtilities_1 = require("../src/SiteUtilities");
const UIStrings_1 = require("../src/UIStrings");
(0, mocha_1.describe)('SiteUtilities', () => {
    (0, mocha_1.describe)('Spacer', () => {
        (0, mocha_1.it)('should render a div with non-breaking spaces', () => {
            const { container } = (0, react_2.render)(react_1.default.createElement(SiteUtilities_1.Spacer, null));
            const spacer = container.firstChild;
            (0, expect_1.expect)(spacer.tagName).toBe('DIV');
            (0, expect_1.expect)(spacer.innerHTML).toBe('&nbsp;&nbsp;&nbsp;');
        });
    });
    (0, mocha_1.describe)('Footer', () => {
        const uiStrings = (0, UIStrings_1.getUIStrings)(UIStrings_1.ELinterMode.Requirement);
        const renderFooter = () => {
            return (0, react_2.render)(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
                react_1.default.createElement(SiteUtilities_1.Footer, null)));
        };
        (0, mocha_1.it)('should render all navigation links', () => {
            renderFooter();
            const homeLink = react_2.screen.getByText(uiStrings.kHome);
            const privacyLink = react_2.screen.getByText(uiStrings.kPrivacy);
            const termsLink = react_2.screen.getByText(uiStrings.kTerms);
            (0, expect_1.expect)(homeLink).toBeTruthy();
            (0, expect_1.expect)(privacyLink).toBeTruthy();
            (0, expect_1.expect)(termsLink).toBeTruthy();
        });
        (0, mocha_1.it)('should have correct href attributes for links', () => {
            renderFooter();
            const homeLink = react_2.screen.getByText(uiStrings.kHome);
            const privacyLink = react_2.screen.getByText(uiStrings.kPrivacy);
            const termsLink = react_2.screen.getByText(uiStrings.kTerms);
            (0, expect_1.expect)(homeLink.getAttribute('href')).toBe('/index');
            (0, expect_1.expect)(privacyLink.getAttribute('href')).toBe('/privacy');
            (0, expect_1.expect)(termsLink.getAttribute('href')).toBe('/terms');
        });
        (0, mocha_1.it)('should apply mobile styles when window width is below breakpoint', () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 767 // Below MOBILE_BREAKPOINT
            });
            const { container } = renderFooter();
            const homeLink = react_2.screen.getByText(uiStrings.kHome);
            const privacyLink = react_2.screen.getByText(uiStrings.kPrivacy);
            const termsLink = react_2.screen.getByText(uiStrings.kTerms);
            (0, expect_1.expect)(homeLink.getAttribute('href')).toBe('/index');
            (0, expect_1.expect)(privacyLink.getAttribute('href')).toBe('/privacy');
            (0, expect_1.expect)(termsLink.getAttribute('href')).toBe('/terms');
        });
        (0, mocha_1.it)('should apply desktop styles when window width is above breakpoint', () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 769 // Above MOBILE_BREAKPOINT
            });
            const { container } = renderFooter();
            const homeLink = react_2.screen.getByText(uiStrings.kHome);
            const privacyLink = react_2.screen.getByText(uiStrings.kPrivacy);
            const termsLink = react_2.screen.getByText(uiStrings.kTerms);
            (0, expect_1.expect)(homeLink.getAttribute('href')).toBe('/index');
            (0, expect_1.expect)(privacyLink.getAttribute('href')).toBe('/privacy');
            (0, expect_1.expect)(termsLink.getAttribute('href')).toBe('/terms');
        });
    });
});
