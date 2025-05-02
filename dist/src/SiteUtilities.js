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
const MOBILE_BREAKPOINT = 768;
const Spacer = (props) => {
    return (react_1.default.createElement("div", null, "\u00A0\u00A0\u00A0"));
};
exports.Spacer = Spacer;
const Footer = (props) => {
    const uiStrings = (0, UIStrings_1.getUIStrings)(UIStrings_1.EAppMode.kYardTalk);
    const linkClasses = (0, CommonStyles_1.standardLinkStyles)();
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const containerStyle = isMobile ?
        (0, CommonStyles_1.mobileRowElementStyles)().root :
        (0, CommonStyles_1.standardJustifiedRowElementStyles)().root;
    return (react_1.default.createElement("div", { className: containerStyle },
        react_1.default.createElement(react_router_dom_1.Link, { to: "/index", className: linkClasses.centred }, uiStrings.kHome),
        react_1.default.createElement(react_router_dom_1.Link, { to: "/privacy", className: linkClasses.centred }, uiStrings.kPrivacy),
        react_1.default.createElement(react_router_dom_1.Link, { to: "/terms", className: linkClasses.centred }, uiStrings.kTerms)));
};
exports.Footer = Footer;
