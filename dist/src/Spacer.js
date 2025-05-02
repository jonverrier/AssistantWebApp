"use strict";
/**
 * Spacer.tsx
 *
 * A simple component that provides vertical spacing in the UI.
 * Renders non-breaking spaces to create consistent vertical gaps between elements.
 */
/*! Copyright Jon Verrier 2025 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spacer = void 0;
const react_1 = __importDefault(require("react"));
const Spacer = (props) => {
    return (react_1.default.createElement("div", null, "\u00A0\u00A0\u00A0"));
};
exports.Spacer = Spacer;
