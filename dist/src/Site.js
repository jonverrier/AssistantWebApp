"use strict";
/**
 * Site.tsx
 *
 * Configures the application routing and theme provider setup.
 * Defines the main site structure using React Router and Fluent UI's theme provider.
 * Handles routing between the main application view and static content pages.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Site = exports.RoutedSite = void 0;
// Copyright (c) Jon Verrier, 2025
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const Login_1 = require("./Login");
const PlainText_1 = require("./PlainText");
const react_components_1 = require("@fluentui/react-components");
const UIStrings_1 = require("./UIStrings");
const TermsContent_1 = require("./TermsContent");
const PrivacyContent_1 = require("./PrivacyContent");
const RoutedSite = (props) => {
    return (react_1.default.createElement(react_components_1.FluentProvider, { theme: react_components_1.teamsDarkTheme },
        react_1.default.createElement(react_router_dom_1.BrowserRouter, { future: {
                v7_startTransition: true,
                v7_relativeSplatPath: true
            } },
            react_1.default.createElement(exports.Site, { appMode: props.appMode }))));
};
exports.RoutedSite = RoutedSite;
const Site = (props) => {
    const uiStrings = (0, UIStrings_1.getUIStrings)(props.appMode);
    const routes = (0, react_router_dom_1.useRoutes)([
        {
            path: '/',
            element: react_1.default.createElement(Login_1.Login, { appMode: props.appMode })
        },
        {
            path: '/index',
            element: react_1.default.createElement(Login_1.Login, { appMode: props.appMode })
        },
        {
            path: '/index.html',
            element: react_1.default.createElement(Login_1.Login, { appMode: props.appMode })
        },
        {
            path: '/privacy',
            element: react_1.default.createElement(PlainText_1.PlainText, { title: uiStrings.kPrivacyTitle, content: PrivacyContent_1.kPrivacyContent })
        },
        {
            path: '/privacy.html',
            element: react_1.default.createElement(PlainText_1.PlainText, { title: uiStrings.kPrivacyTitle, content: PrivacyContent_1.kPrivacyContent })
        },
        {
            path: '/terms',
            element: react_1.default.createElement(PlainText_1.PlainText, { title: uiStrings.kTermsTitle, content: TermsContent_1.kTermsContent })
        },
        {
            path: '/terms.html',
            element: react_1.default.createElement(PlainText_1.PlainText, { title: uiStrings.kTermsTitle, content: TermsContent_1.kTermsContent })
        },
        {
            path: '*',
            element: react_1.default.createElement(Login_1.Login, { appMode: props.appMode })
        }
    ]);
    return routes;
};
exports.Site = Site;
