"use strict";
/**
 * Site.test.tsx
 *
 * Unit tests for the RoutedSite and Site components using Mocha and expect.
 * Tests routing functionality and theme setup.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Jon Verrier, 2025
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const react_router_dom_1 = require("react-router-dom");
const Site_1 = require("../src/Site");
const expect_1 = require("expect");
const UIStrings_1 = require("../src/UIStrings");
let linterModes = [UIStrings_1.ELinterMode.Requirement, UIStrings_1.ELinterMode.UserStory];
for (let linterMode of linterModes) {
    describe('RoutedSite Component', () => {
        it('renders without crashing', () => {
            const { container } = (0, react_2.render)(react_1.default.createElement(Site_1.RoutedSite, { linterMode: linterMode }));
            (0, expect_1.expect)(container).toBeTruthy();
        });
    });
}
for (let linterMode of linterModes) {
    describe('Site Component', () => {
        const uiStrings = (0, UIStrings_1.getUIStrings)(linterMode);
        it('renders App component for root path', () => {
            (0, react_2.render)(react_1.default.createElement(react_router_dom_1.MemoryRouter, { initialEntries: ['/'] },
                react_1.default.createElement(Site_1.Site, { linterMode: linterMode })));
            // Since App is rendered, we should see its content
            const privacyTitle = react_2.screen.getByText(uiStrings.kSpecificationLinterCaption);
            (0, expect_1.expect)(privacyTitle).toBeTruthy();
        });
        it('renders App component for /index path', () => {
            (0, react_2.render)(react_1.default.createElement(react_router_dom_1.MemoryRouter, { initialEntries: ['/index'] },
                react_1.default.createElement(Site_1.Site, { linterMode: linterMode })));
            const privacyTitle = react_2.screen.getByText(uiStrings.kSpecificationLinterCaption);
            (0, expect_1.expect)(privacyTitle).toBeTruthy();
        });
        it('renders App component for /index.html path', () => {
            (0, react_2.render)(react_1.default.createElement(react_router_dom_1.MemoryRouter, { initialEntries: ['/index.html'] },
                react_1.default.createElement(Site_1.Site, { linterMode: linterMode })));
            const privacyTitle = react_2.screen.getByText(uiStrings.kSpecificationLinterCaption);
            (0, expect_1.expect)(privacyTitle).toBeTruthy();
        });
        it('renders PlainText component for /privacy path', () => {
            (0, react_2.render)(react_1.default.createElement(react_router_dom_1.MemoryRouter, { initialEntries: ['/privacy'] },
                react_1.default.createElement(Site_1.Site, { linterMode: linterMode })));
            const privacyTitle = react_2.screen.getByText(uiStrings.kPrivacyTitle);
            (0, expect_1.expect)(privacyTitle).toBeTruthy();
        });
        it('renders PlainText component for /privacy.html path', () => {
            (0, react_2.render)(react_1.default.createElement(react_router_dom_1.MemoryRouter, { initialEntries: ['/privacy.html'] },
                react_1.default.createElement(Site_1.Site, { linterMode: linterMode })));
            const privacyTitle = react_2.screen.getByText(uiStrings.kPrivacyTitle);
            (0, expect_1.expect)(privacyTitle).toBeTruthy();
        });
        it('renders PlainText component for /terms path', () => {
            (0, react_2.render)(react_1.default.createElement(react_router_dom_1.MemoryRouter, { initialEntries: ['/terms'] },
                react_1.default.createElement(Site_1.Site, { linterMode: linterMode })));
            const termsTitle = react_2.screen.getByText(uiStrings.kTermsTitle);
            (0, expect_1.expect)(termsTitle).toBeTruthy();
        });
        it('renders PlainText component for /terms.html path', () => {
            (0, react_2.render)(react_1.default.createElement(react_router_dom_1.MemoryRouter, { initialEntries: ['/terms.html'] },
                react_1.default.createElement(Site_1.Site, { linterMode: linterMode })));
            const termsTitle = react_2.screen.getByText(uiStrings.kTermsTitle);
            (0, expect_1.expect)(termsTitle).toBeTruthy();
        });
        it('handles unknown routes gracefully', () => {
            (0, react_2.render)(react_1.default.createElement(react_router_dom_1.MemoryRouter, { initialEntries: ['/unknown'] },
                react_1.default.createElement(Site_1.Site, { linterMode: linterMode })));
            // Should default to App component for unknown routes
            const privacyTitle = react_2.screen.getByText(uiStrings.kSpecificationLinterCaption);
            (0, expect_1.expect)(privacyTitle).toBeTruthy();
        });
    });
}
