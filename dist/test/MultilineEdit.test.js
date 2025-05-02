"use strict";
/**
 * MultilineEdit.test.tsx
 *
 * Unit tests for the MultilineEdit component that provides a multiline text input field
 * with dynamic height adjustment and keyboard controls.
 */
// Copyright (c) Jon Verrier, 2025
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const expect_1 = __importDefault(require("expect"));
const MultilineEdit_1 = require("../src/MultilineEdit");
const MultilineEditUIStrings_1 = require("../src/MultilineEditUIStrings");
describe('MultilineEdit Component', () => {
    const defaultProps = {
        caption: 'Test Caption',
        placeholder: 'Enter text here',
        maxLength: 100,
        message: '',
        fontNameForTextWrapCalculation: '12px Arial',
        onSend: () => { },
        onChange: () => { },
        enabled: true
    };
    it('renders with correct caption and placeholder', () => {
        (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps }));
        (0, expect_1.default)(react_2.screen.getByText('Test Caption')).toBeTruthy();
        (0, expect_1.default)(react_2.screen.getByPlaceholderText('Enter text here')).toBeTruthy();
    });
    it('calls onChange when text is entered', () => {
        let changedText = '';
        const onChange = (text) => {
            changedText = text;
        };
        (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps, onChange: onChange }));
        const textarea = react_2.screen.getByPlaceholderText('Enter text here');
        react_2.fireEvent.change(textarea, { target: { value: 'New text' } });
        (0, expect_1.default)(changedText).toBe('New text');
    });
    it('calls onSend when Ctrl+Enter is pressed', () => {
        let sentText = '';
        const onSend = (text) => {
            sentText = text;
        };
        (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps, message: "Test message", onSend: onSend }));
        const textarea = react_2.screen.getByPlaceholderText('Enter text here');
        react_2.fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
        (0, expect_1.default)(sentText).toBe('Test message');
    });
    it('clears text when Escape is pressed', () => {
        let clearedText = '';
        const onChange = (text) => {
            clearedText = text;
        };
        (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps, message: "Test message", onChange: onChange }));
        const textarea = react_2.screen.getByPlaceholderText('Enter text here');
        react_2.fireEvent.keyDown(textarea, { key: 'Escape' });
        (0, expect_1.default)(clearedText).toBe('');
    });
    it('respects maxLength property', () => {
        let changedText = '';
        const onChange = (text) => {
            changedText = text;
        };
        (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps, maxLength: 5, onChange: onChange }));
        const textarea = react_2.screen.getByPlaceholderText('Enter text here');
        react_2.fireEvent.change(textarea, { target: { value: '12345678910' } });
        // The component passes the full text to onChange, and the textarea's maxLength
        // attribute handles the visual limitation
        (0, expect_1.default)(changedText).toBe('12345');
        (0, expect_1.default)(textarea.maxLength).toBe(5);
    });
    it('displays message prompt hint', () => {
        (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps }));
        (0, expect_1.default)(react_2.screen.getByText(MultilineEditUIStrings_1.EMultilineEditUIStrings.kMessageTextPrompt)).toBeTruthy();
    });
    it('adjusts height based on content', () => {
        (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps, message: "Line 1\\nLine 2\\nLine 3" }));
        const textarea = react_2.screen.getByPlaceholderText('Enter text here');
        const style = window.getComputedStyle(textarea);
        // The height should be greater than the default single-line height
        (0, expect_1.default)(parseInt(style.height)).toBeGreaterThan(20);
    });
    it('respects enabled property', () => {
        // First render with enabled=false
        const { unmount } = (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps, enabled: false }));
        // Get the textarea and check it's disabled
        const disabledTextarea = react_2.screen.getByPlaceholderText('Enter text here');
        (0, expect_1.default)(disabledTextarea.disabled).toBe(true);
        // Unmount the first render
        unmount();
        // Then render with enabled=true
        (0, react_2.render)(react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...defaultProps, enabled: true }));
        // Get the new textarea and check it's not disabled
        const enabledTextarea = react_2.screen.getByPlaceholderText('Enter text here');
        (0, expect_1.default)(enabledTextarea.disabled).toBe(false);
    });
});
