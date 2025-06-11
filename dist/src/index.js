"use strict";
/**
 * index.tsx
 *
 * Entry point for the React application.
 */
// Copyright (c) Jon Verrier, 2025
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
const Site_1 = require("./Site");
const PrivacySite_1 = require("./PrivacySite");
const TermsSite_1 = require("./TermsSite");
// This allows code to be loaded in node.js for tests, even if we dont run actual React methods
if (document !== undefined && document.getElementById !== undefined) {
    const root = (0, client_1.createRoot)(document.getElementById("reactRoot"));
    // Check which page we're on
    const path = window.location.pathname;
    const isPrivacyPage = path.includes('privacy');
    const isTermsPage = path.includes('terms');
    root.render(isPrivacyPage ? react_1.default.createElement(PrivacySite_1.PrivacySite, null) :
        isTermsPage ? react_1.default.createElement(TermsSite_1.TermsSite, null) :
            react_1.default.createElement(Site_1.RoutedSite, null));
}
