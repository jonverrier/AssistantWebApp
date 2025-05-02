"use strict";
/**
 * Plain.test.tsx
 *
 * Unit tests for the Plain component using Mocha and expect.
 * Tests rendering of title, content, and various text formatting scenarios.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Jon Verrier, 2025
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const PlainText_1 = require("../src/PlainText");
const expect_1 = require("expect");
const react_router_dom_1 = require("react-router-dom");
describe('Plain Component', () => {
    it('renders title correctly', () => {
        const { getByText } = (0, react_2.render)(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
            react_1.default.createElement(PlainText_1.PlainText, { title: "Test Title", content: "Test content" })));
        (0, expect_1.expect)(getByText('Test Title')).toBeTruthy();
    });
    it('renders normal text content correctly', () => {
        const { getByText } = (0, react_2.render)(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
            react_1.default.createElement(PlainText_1.PlainText, { title: "Test", content: "This is a test line" })));
        (0, expect_1.expect)(getByText('This is a test line')).toBeTruthy();
    });
    it('renders numbered headings correctly', () => {
        const { getByText } = (0, react_2.render)(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
            react_1.default.createElement(PlainText_1.PlainText, { title: "Test", content: "1. First heading\r\n                2. Second heading" })));
        (0, expect_1.expect)(getByText('1. First heading')).toBeTruthy();
        (0, expect_1.expect)(getByText('2. Second heading')).toBeTruthy();
    });
    it('renders URLs as links', () => {
        const { getByText } = (0, react_2.render)(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
            react_1.default.createElement(PlainText_1.PlainText, { title: "Test", content: "Visit https://example.com for more info" })));
        const link = getByText('https://example.com');
        (0, expect_1.expect)(link).toBeTruthy();
        (0, expect_1.expect)(link.getAttribute('href')).toBe('https://example.com');
    });
    it('handles mixed content correctly', () => {
        const content = `1. First point
Normal text line
Visit https://example.com
2. Second point
Another normal line`;
        const { getByText } = (0, react_2.render)(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
            react_1.default.createElement(PlainText_1.PlainText, { title: "Test", content: content })));
        (0, expect_1.expect)(getByText('1. First point')).toBeTruthy();
        (0, expect_1.expect)(getByText('Normal text line')).toBeTruthy();
        (0, expect_1.expect)(getByText('https://example.com')).toBeTruthy();
        (0, expect_1.expect)(getByText('2. Second point')).toBeTruthy();
        (0, expect_1.expect)(getByText('Another normal line')).toBeTruthy();
    });
    it('renders empty content gracefully', () => {
        const { container } = (0, react_2.render)(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
            react_1.default.createElement(PlainText_1.PlainText, { title: "Test", content: "" })));
        (0, expect_1.expect)(container).toBeTruthy();
    });
});
