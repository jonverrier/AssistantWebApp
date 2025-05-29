"use strict";
/**
 * Site.tsx
 *
 * Configures the application routing and theme provider setup.
 * Defines the main site structure using React Router and Fluent UI's theme provider.
 * Handles routing between the main application view and static content pages.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Site = exports.RoutedSite = void 0;
// Copyright (c) Jon Verrier, 2025
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const Login_1 = require("./Login");
const PlainText_1 = require("./PlainText");
const Home_1 = require("./Home");
const react_components_1 = require("@fluentui/react-components");
const UIStrings_1 = require("./UIStrings");
const UserContext_1 = require("./UserContext");
const LocalStorage_1 = require("./LocalStorage");
const ScrollToTop_1 = require("./ScrollToTop");
const TermsContent_1 = require("./TermsContent");
const PrivacyContent_1 = require("./PrivacyContent");
const AboutContent_1 = require("./AboutContent");
const AssistantChatApiTypes_1 = require("../import/AssistantChatApiTypes");
// Routed site component
const RoutedSite = (props) => {
    return (react_1.default.createElement(react_components_1.FluentProvider, { theme: react_components_1.teamsDarkTheme },
        react_1.default.createElement(UserContext_1.UserProvider, { storage: LocalStorage_1.browserSessionStorage },
            react_1.default.createElement(react_router_dom_1.BrowserRouter, { future: {
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                } },
                react_1.default.createElement(ScrollToTop_1.ScrollToTop, null),
                react_1.default.createElement(exports.Site, null)))));
};
exports.RoutedSite = RoutedSite;
const DEFAULT_PERSONALITY = AssistantChatApiTypes_1.EAssistantPersonality.kDemoAssistant;
const PersonalityRedirect = ({ personality, to }) => {
    const { setPersonality } = (0, UserContext_1.useUser)();
    (0, react_1.useEffect)(() => {
        setPersonality(personality);
    }, [personality, setPersonality]);
    return react_1.default.createElement(react_router_dom_1.Navigate, { to: to, replace: true });
};
// Site component
const Site = (props) => {
    const { personality, setPersonality } = (0, UserContext_1.useUser)();
    const uiStrings = (0, UIStrings_1.getCommonUIStrings)();
    // Initialize Google Sign-In
    (0, react_1.useEffect)(() => {
        // Load Google Sign-In script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        return () => {
            const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (scriptElement && scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
        };
    }, []);
    const routes = (0, react_router_dom_1.useRoutes)([
        {
            path: '/',
            element: react_1.default.createElement(Home_1.Home, { title: uiStrings.kHomeTitle, content: AboutContent_1.kAboutContent })
        },
        {
            path: '/chat',
            element: react_1.default.createElement(Login_1.Login, { personality: personality ?? DEFAULT_PERSONALITY })
        },
        {
            path: '/chat.html',
            element: react_1.default.createElement(Login_1.Login, { personality: personality ?? DEFAULT_PERSONALITY })
        },
        {
            path: '/theyard',
            element: react_1.default.createElement(PersonalityRedirect, { personality: AssistantChatApiTypes_1.EAssistantPersonality.kTheYardAssistant, to: "/chat" })
        },
        {
            path: '/theyard.html',
            element: react_1.default.createElement(PersonalityRedirect, { personality: AssistantChatApiTypes_1.EAssistantPersonality.kTheYardAssistant, to: "/chat" })
        },
        {
            path: '/demo',
            element: react_1.default.createElement(PersonalityRedirect, { personality: AssistantChatApiTypes_1.EAssistantPersonality.kDemoAssistant, to: "/chat" })
        },
        {
            path: '/demo.html',
            element: react_1.default.createElement(PersonalityRedirect, { personality: AssistantChatApiTypes_1.EAssistantPersonality.kDemoAssistant, to: "/chat" })
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
            element: react_1.default.createElement(Home_1.Home, { title: uiStrings.kHomeTitle, content: AboutContent_1.kAboutContent })
        }
    ]);
    return routes;
};
exports.Site = Site;
