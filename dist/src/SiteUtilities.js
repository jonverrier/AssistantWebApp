"use strict";
/**
 * PageUtilities.tsx
 *
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = exports.Spacer = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const CommonStyles_1 = require("./CommonStyles");
const UIStrings_1 = require("./UIStrings");
const react_components_1 = require("@fluentui/react-components");
const MOBILE_BREAKPOINT = 768;
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
    return (react_1.default.createElement("div", { className: styles.footerContainer },
        react_1.default.createElement("div", { className: styles.footerContent },
            react_1.default.createElement(react_router_dom_1.Link, { to: "/index", className: linkClasses.centred }, uiStrings.kHome),
            react_1.default.createElement(react_router_dom_1.Link, { to: "/privacy", className: linkClasses.centred }, uiStrings.kPrivacy),
            react_1.default.createElement(react_router_dom_1.Link, { to: "/terms", className: linkClasses.centred }, uiStrings.kTerms))));
};
exports.Footer = Footer;
