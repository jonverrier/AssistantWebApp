"use strict";
/**
 * UIStrings.ts
 *
 * Defines UI strings used throughout the application. Centralizes all text content
 * for easy localization and maintenance.
 */
/*! Copyright Jon Verrier 2025 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIStrings = exports.TheYardUIStrings = exports.CommonUIStrings = exports.EAppMode = exports.EMultilineEditUIStrings = void 0;
exports.getUIStrings = getUIStrings;
var MultilineEditUIStrings_1 = require("./MultilineEditUIStrings");
Object.defineProperty(exports, "EMultilineEditUIStrings", { enumerable: true, get: function () { return MultilineEditUIStrings_1.EMultilineEditUIStrings; } });
// Type for the current linter mode
var EAppMode;
(function (EAppMode) {
    EAppMode["kYardTalk"] = "yardtalk";
})(EAppMode || (exports.EAppMode = EAppMode = {}));
exports.CommonUIStrings = {
    kProcessing: "Processing. This may take several seconds.",
    kWarning: "Warning:",
    kInfo: "Information:",
    kError: "Error:",
    kSuccess: "Success:",
    kServerErrorDescription: "Sorry, we could not get a response from the server, Please try again later.",
    kHome: "Home",
    kPrivacyTitle: "Privacy Policy",
    kTermsTitle: "Terms of Service",
    kPrivacy: "Privacy",
    kTerms: "Terms"
};
exports.TheYardUIStrings = {
    kAppPageCaption: "Yard Talk",
    kAppPageStrapline: "Where sweat meets sass—and the burpees never end (even when you ask).",
    kLinks: "[CrossFit main site](https://www.crossfit.com/)",
    kChatPreamble: "Chat to the Yard Talk AI by entering your question in the edit box. Treat your content as public:",
    kChatPlaceholder: "Enter your question...",
    kResponsePlaceholder: "When your question is answered, the answer will appear here.",
    kLooksOffTopic: "That looks off-topic. Please try again."
};
// Default UI strings that combine common and requirement strings
exports.UIStrings = {
    ...exports.CommonUIStrings,
    ...exports.TheYardUIStrings
};
// Function to get the appropriate UI strings based on the current mode
function getUIStrings(mode) {
    switch (mode) {
        case EAppMode.kYardTalk:
            return exports.UIStrings;
        default:
            return exports.UIStrings;
    }
}
