"use strict";
/**
 * CopyableText.test.tsx
 *
 * Unit tests for the CopyableText component that displays text with a copy-to-clipboard button.
 */
// Copyright (c) Jon Verrier, 2025
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const expect_1 = __importDefault(require("expect"));
const CopyableText_1 = require("../src/CopyableText");
describe('CopyableText Component', () => {
    const defaultProps = {
        placeholder: 'No text to display',
        text: 'Sample text to copy',
    };
    it('renders with correct text when text is provided', () => {
        (0, react_2.render)(react_1.default.createElement(CopyableText_1.CopyableText, { ...defaultProps }));
        (0, expect_1.default)(react_2.screen.getByText('Sample text to copy')).toBeTruthy();
        (0, expect_1.default)(react_2.screen.getByLabelText('Copy')).toBeTruthy();
    });
    it('renders placeholder when text is empty', () => {
        (0, react_2.render)(react_1.default.createElement(CopyableText_1.CopyableText, { placeholder: "No text to display", text: "" }));
        (0, expect_1.default)(react_2.screen.getByText('No text to display')).toBeTruthy();
        (0, expect_1.default)(react_2.screen.queryByLabelText('Copy')).toBeNull();
    });
    it('calls clipboard API when copy button is clicked', () => {
        // Mock the clipboard API
        const mockClipboard = {
            writeText: (text) => Promise.resolve(),
        };
        Object.defineProperty(navigator, 'clipboard', {
            value: mockClipboard,
            writable: true,
        });
        let clipboardCalled = false;
        const originalWriteText = mockClipboard.writeText;
        mockClipboard.writeText = (text) => {
            clipboardCalled = true;
            (0, expect_1.default)(text).toBe('Sample text to copy');
            return originalWriteText(text);
        };
        (0, react_2.render)(react_1.default.createElement(CopyableText_1.CopyableText, { ...defaultProps }));
        const copyButton = react_2.screen.getByLabelText('Copy');
        react_2.fireEvent.click(copyButton);
        (0, expect_1.default)(clipboardCalled).toBeTruthy();
    });
    it('handles clipboard error gracefully', () => {
        // Mock the clipboard API to throw an error
        const mockClipboard = {
            writeText: (text) => Promise.reject(new Error('Clipboard error')),
        };
        Object.defineProperty(navigator, 'clipboard', {
            value: mockClipboard,
            writable: true,
        });
        (0, react_2.render)(react_1.default.createElement(CopyableText_1.CopyableText, { ...defaultProps }));
        const copyButton = react_2.screen.getByLabelText('Copy');
        react_2.fireEvent.click(copyButton);
        // The component should not crash and should still be visible
        (0, expect_1.default)(react_2.screen.getByText('Sample text to copy')).toBeTruthy();
    });
});
