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
const react_components_1 = require("@fluentui/react-components");
const CommonStyles_1 = require("./CommonStyles");
const SiteUtilities_1 = require("./SiteUtilities");
// The image should be placed in public/assets/img/lifter.png
const lifterIcon = 'assets/img/lifter-w.png';
const PlainText = (props) => {
    const pageOuterClasses = (0, OuterStyles_1.pageOuterStyles)();
    const innerColumnClasses = (0, OuterStyles_1.innerColumnStyles)();
    const textClasses = (0, CommonStyles_1.standardTextStyles)();
    // We split the text by newlines and then check if the line starts with a number and a dot.
    // If it does, we treat it as a heading, otherwise we treat it as a normal line of text.
    // If the line starts with a URL, we treat it as a link.
    return (react_1.default.createElement("div", { className: pageOuterClasses.root },
        react_1.default.createElement("div", { className: innerColumnClasses.root },
            react_1.default.createElement(SiteUtilities_1.Header, { title: props.title }),
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            props.content.split('\n').map((line, index) => {
                if (/^\d+\.\s/.test(line)) {
                    return react_1.default.createElement(react_components_1.Text, { key: index, className: textClasses.subHeadingLeft }, line);
                }
                if (line.match(/https?:\/\/\S+/)) {
                    const parts = line.split(/(https?:\/\/\S+)/);
                    return (react_1.default.createElement(react_components_1.Text, { key: index, className: textClasses.normal }, parts.map((part, i) => part.match(/^https?:\/\//) ?
                        react_1.default.createElement(react_components_1.Link, { key: i, href: part }, part) :
                        part)));
                }
                return react_1.default.createElement(react_components_1.Text, { key: index, className: textClasses.normal }, line);
            }),
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            react_1.default.createElement(SiteUtilities_1.Footer, null))));
};
exports.PlainText = PlainText;
