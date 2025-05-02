"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const expect_1 = __importDefault(require("expect"));
const Message_1 = require("./Message");
describe('Message Component', () => {
    const defaultProps = {
        intent: Message_1.MessageIntent.kInfo,
        title: 'Test Title',
        body: 'Test Body',
        dismissable: true,
    };
    it('renders with correct title and body', () => {
        (0, react_2.render)(react_1.default.createElement(Message_1.Message, { ...defaultProps }));
        (0, expect_1.default)(react_2.screen.getByText('Test Title')).toBeTruthy();
        (0, expect_1.default)(react_2.screen.getByText('Test Body')).toBeTruthy();
    });
    it('renders with different intents', () => {
        const { rerender } = (0, react_2.render)(react_1.default.createElement(Message_1.Message, { ...defaultProps, intent: Message_1.MessageIntent.kInfo }));
        (0, expect_1.default)(react_2.screen.getByRole('alert').getAttribute('data-intent')).toBe('info');
        rerender(react_1.default.createElement(Message_1.Message, { ...defaultProps, intent: Message_1.MessageIntent.kWarning }));
        (0, expect_1.default)(react_2.screen.getByRole('alert').getAttribute('data-intent')).toBe('warning');
        rerender(react_1.default.createElement(Message_1.Message, { ...defaultProps, intent: Message_1.MessageIntent.kError }));
        (0, expect_1.default)(react_2.screen.getByRole('alert').getAttribute('data-intent')).toBe('error');
    });
    it('shows dismiss button when dismissable is true', () => {
        (0, react_2.render)(react_1.default.createElement(Message_1.Message, { ...defaultProps, dismissable: true }));
        (0, expect_1.default)(react_2.screen.getByLabelText('dismiss')).toBeTruthy();
    });
    it('does not show dismiss button when dismissable is false', () => {
        (0, react_2.render)(react_1.default.createElement(Message_1.Message, { ...defaultProps, dismissable: false }));
        (0, expect_1.default)(react_2.screen.queryByLabelText('dismiss')).toBeNull();
    });
    it('dismisses message when dismiss button is clicked', () => {
        (0, react_2.render)(react_1.default.createElement(Message_1.Message, { ...defaultProps }));
        const dismissButton = react_2.screen.getByLabelText('dismiss');
        react_2.fireEvent.click(dismissButton);
        (0, expect_1.default)(react_2.screen.queryByText('Test Title')).toBeNull();
        (0, expect_1.default)(react_2.screen.queryByText('Test Body')).toBeNull();
    });
});
