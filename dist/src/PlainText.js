"use strict";
/**
 * Plain.tsx
 *
 * Renders a simple page component with a title, content and back link.
 * Used for displaying privacy policy and other static content pages.
 * Utilizes common layout styles from OuterStyles.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainText = void 0;
/*! Copyright Jon Verrier 2025 */
// Copyright (c) Jon Verrier, 2025
const react_1 = __importDefault(require("react"));
const OuterStyles_1 = require("./OuterStyles");
const CommonStyles_1 = require("./CommonStyles");
const SiteUtilities_1 = require("./SiteUtilities");
const PlainTextParagraphs_1 = require("./PlainTextParagraphs");
const PlainText = (props) => {
    const pageOuterClasses = (0, OuterStyles_1.pageOuterStyles)();
    const innerColumnClasses = (0, OuterStyles_1.innerColumnStyles)();
    const textClasses = (0, CommonStyles_1.standardTextStyles)();
    return (react_1.default.createElement("div", { className: pageOuterClasses.root },
        react_1.default.createElement("div", { className: innerColumnClasses.root },
            react_1.default.createElement(SiteUtilities_1.Header, { title: props.title }),
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            react_1.default.createElement(PlainTextParagraphs_1.PlainTextParagraphs, { content: props.content }),
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            react_1.default.createElement(SiteUtilities_1.Footer, null))));
};
exports.PlainText = PlainText;
