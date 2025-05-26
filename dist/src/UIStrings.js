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
    kWarning: "Warning:",
    kInfo: "Information:",
    kError: "Error:",
    kSuccess: "Success:",
    kServerErrorDescription: "Sorry, we could not get a response from the server, Please try again later.",
    kHome: "Home",
    kPrivacyTitle: "Privacy Policy",
    kTermsTitle: "Terms of Service",
    kPrivacy: "Privacy",
    kTerms: "Terms",
    kAIWarning: "AI can make mistakes. Think about it.",
    kProcessingPleaseWait: "Please wait a few seconds...",
    kArchivingPleaseWait: "Please wait a few seconds...",
    kArchivingDescription: "Summarising and cleaning out old messages to make room for new ones."
};
exports.TheYardUIStrings = {
    kAppPageCaption: "Yard Talk",
    kAppPageStrapline: "Where sweat meets sass.",
    kOverview: "We're trialling something new – and no, it's not more burpees. Meet our 'Yard Talk' chatbot; your online training assistant here to answer fitness-related questions, chat about CrossFit, and maybe even stop you from skipping Engines. For the next three months, we’re testing how AI can support our community. Try it out, ask it anything (health and fitness-related, please), and let us know what you think – your feedback will shape what comes next.",
    kLinks: "[]",
    kChatPreamble: "Chat to the Yard Talk AI by typing your question in the box below. Don't share private information.",
    kChatPlaceholder: "Let's talk about fitness...",
    kLooksOffTopic: "Sorry, that looks off-topic. We should just talk about fitness. Please try again."
};
// Default UI strings that combine common and brand strings
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
