"use strict";
/**
 * Privacy.tsx
 *
 * Privacy policy page component.
 */
// Copyright (c) Jon Verrier, 2025
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Privacy = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const OuterStyles_1 = require("./OuterStyles");
const Privacy = () => {
    const pageOuterClasses = (0, OuterStyles_1.pageOuterStyles)();
    const innerColumnClasses = (0, OuterStyles_1.innerColumnStyles)();
    return (react_1.default.createElement("div", { className: pageOuterClasses.root },
        react_1.default.createElement("div", { className: innerColumnClasses.root }),
        react_1.default.createElement("h1", null, "Privacy Policy"),
        react_1.default.createElement("p", null, "This is the privacy policy page."),
        react_1.default.createElement(react_router_dom_1.Link, { to: "/" }, "Back to Home")));
};
exports.Privacy = Privacy;
