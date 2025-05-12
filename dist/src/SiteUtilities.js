"use strict";
/**
 * PageUtilities.tsx
 *
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */
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
exports.Footer = exports.Spacer = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const CommonStyles_1 = require("./CommonStyles");
const UIStrings_1 = require("./UIStrings");
const react_components_1 = require("@fluentui/react-components");
const MOBILE_BREAKPOINT = 512;
const useFooterStyles = (0, react_components_1.makeStyles)({
    footerContainer: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--colorNeutralBackground1)',
        ...react_components_1.shorthands.padding('12px'),
        ...react_components_1.shorthands.borderTop('1px', 'solid', 'var(--colorNeutralStroke1)'),
        zIndex: 100,
        '&::after': {
            content: '""',
            height: 'var(--footer-height)',
        }
    },
    footerContent: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        [`@media (max-width: ${MOBILE_BREAKPOINT}px)`]: {
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
        },
    },
});
const Spacer = (props) => {
    return (react_1.default.createElement("div", null, "\u00A0\u00A0\u00A0"));
};
exports.Spacer = Spacer;
const Footer = (props) => {
    const uiStrings = (0, UIStrings_1.getUIStrings)(UIStrings_1.EAppMode.kYardTalk);
    const linkClasses = (0, CommonStyles_1.standardLinkStyles)();
    const styles = useFooterStyles();
    const footerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const updateFooterHeight = () => {
            if (footerRef.current) {
                const height = footerRef.current.offsetHeight;
                document.documentElement.style.setProperty('--footer-height', `${height}px`);
            }
        };
        updateFooterHeight();
        window.addEventListener('resize', updateFooterHeight);
        return () => window.removeEventListener('resize', updateFooterHeight);
    }, []);
    return (react_1.default.createElement("div", { ref: footerRef, className: styles.footerContainer },
        react_1.default.createElement("div", { className: styles.footerContent },
            react_1.default.createElement(react_router_dom_1.Link, { to: "/index", className: linkClasses.centred }, uiStrings.kHome),
            react_1.default.createElement(react_router_dom_1.Link, { to: "/privacy", className: linkClasses.centred }, uiStrings.kPrivacy),
            react_1.default.createElement(react_router_dom_1.Link, { to: "/terms", className: linkClasses.centred }, uiStrings.kTerms))));
};
exports.Footer = Footer;
