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
const Spacer = (props) => {
    return (react_1.default.createElement("div", null, "\u00A0\u00A0\u00A0"));
};
exports.Spacer = Spacer;
const Footer = (props) => {
    const linkClasses = (0, CommonStyles_1.standardLinkStyles)();
    return (react_1.default.createElement("div", { className: (0, CommonStyles_1.standardJustifiedRowElementStyles)().root },
        react_1.default.createElement(react_router_dom_1.Link, { to: "/index", className: linkClasses.centred }, "Home"),
        react_1.default.createElement(react_router_dom_1.Link, { to: "/privacy", className: linkClasses.centred }, "Privacy Policy"),
        react_1.default.createElement(react_router_dom_1.Link, { to: "/terms", className: linkClasses.centred }, "Terms of Service")));
};
exports.Footer = Footer;
