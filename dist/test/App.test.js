"use strict";
/**
 * App.test.tsx
 *
 * Unit tests for the main App component, testing rendering and basic functionality.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expect_1 = require("expect");
const react_1 = require("@testing-library/react");
const react_2 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const App_1 = require("../src/App");
const UIStrings_1 = require("../src/UIStrings");
// Helper function to render App component with Router context
const renderWithRouter = (component) => {
    return (0, react_1.render)(react_2.default.createElement(react_router_dom_1.BrowserRouter, null, component));
};
let linterModes = [UIStrings_1.ELinterMode.Requirement, UIStrings_1.ELinterMode.UserStory];
for (let linterMode of linterModes) {
    describe('App Component', () => {
        const uiStrings = (0, UIStrings_1.getUIStrings)(linterMode);
        afterEach(() => {
            (0, react_1.cleanup)();
        });
        it('should render the main heading and description', async () => {
            renderWithRouter(react_2.default.createElement(App_1.App, { linterMode: linterMode }));
            // Check for main heading
            await (0, react_1.waitFor)(() => {
                (0, expect_1.expect)(react_1.screen.getByText(uiStrings.kSpecificationLinterCaption, { exact: true })).toBeTruthy();
            });
            // Check for description text
            await (0, react_1.waitFor)(() => {
                (0, expect_1.expect)(react_1.screen.getByText(uiStrings.kSpecificationLinterDescription, { exact: true })).toBeTruthy();
            });
        });
        it('should render the text input area', () => {
            renderWithRouter(react_2.default.createElement(App_1.App, { linterMode: linterMode }));
            // Check for the text input area
            const textarea = react_1.screen.getByPlaceholderText(uiStrings.kSpecificationPlaceholder);
            (0, expect_1.expect)(textarea).toBeTruthy();
        });
        it('should render external links', () => {
            renderWithRouter(react_2.default.createElement(App_1.App, { linterMode: linterMode }));
            // Check for GTWR link
            const gtwrLink = react_1.screen.getByText(uiStrings.kGtwr);
            (0, expect_1.expect)(gtwrLink).toBeTruthy();
            (0, expect_1.expect)(gtwrLink.getAttribute('href')).toContain('https://www.incose.org');
            // Check for repository link
            const repoLink = react_1.screen.getByText(uiStrings.kRepo);
            (0, expect_1.expect)(repoLink).toBeTruthy();
            (0, expect_1.expect)(repoLink.getAttribute('href')).toContain('https://github.com');
        });
        it('should handle text input changes', () => {
            renderWithRouter(react_2.default.createElement(App_1.App, { linterMode: linterMode }));
            const textarea = react_1.screen.getByPlaceholderText(uiStrings.kSpecificationPlaceholder);
            react_1.fireEvent.change(textarea, { target: { value: 'Test requirement' } });
            (0, expect_1.expect)(textarea.value).toBe('Test requirement');
        });
        it('should show processing state when submitting a requirement', async () => {
            renderWithRouter(react_2.default.createElement(App_1.App, { linterMode: linterMode }));
            const textarea = react_1.screen.getByPlaceholderText(uiStrings.kSpecificationPlaceholder);
            react_1.fireEvent.change(textarea, { target: { value: 'The system should be able to handle 1000 concurrent users' } });
            // Simulate pressing Enter to submit
            react_1.fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', ctrlKey: true });
            // Check for processing message
            await (0, react_1.waitFor)(() => {
                (0, expect_1.expect)(react_1.screen.getByText(uiStrings.kProcessing)).toBeTruthy();
            }, { timeout: 5000 });
        }).timeout(5500);
    });
}
