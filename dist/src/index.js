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
const UIStrings_1 = require("./UIStrings");
const Site_1 = require("./Site");
const LocalStorage_1 = require("./LocalStorage");
// This allows code to be loaded in node.js for tests, even if we dont run actual React methods
if (document !== undefined && document.getElementById !== undefined) {
    const root = (0, client_1.createRoot)(document.getElementById("reactRoot"));
    const storage = LocalStorage_1.browserStorage;
    root.render(react_1.default.createElement(Site_1.RoutedSite, { appMode: UIStrings_1.EAppMode.kYardTalk, storage: storage }));
}
