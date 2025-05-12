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
    kOverview: "The Yard Peckham is proudly the home of CrossFit Peckham. Above all else, we are committed to the improvement of human life and dedicated to offering high quality coaching in an environment that will help you achieve your health, fitness and performance goals. We hope our Yard Talk AI will help along the way. Enjoy.",
    kLinks: "[CrossFit main site](https://www.crossfit.com/), [The Yard](https://www.theyardpeckham.com/)",
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
