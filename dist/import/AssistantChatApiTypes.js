"use strict";
/**
 * @module AssistantChatApiTypes
 *
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */
// Copyright (c) 2025 Jon Verrier
Object.defineProperty(exports, "__esModule", { value: true });
exports.EScreeningClassification = exports.EShowInterstitialPrompt = exports.ELoginProvider = exports.EUserRole = exports.EAssistantPersonality = void 0;
/**
 * An enumeration of possible assistant personalities.
 * Used to specify the desired personality type for chat interactions.
 */
var EAssistantPersonality;
(function (EAssistantPersonality) {
    EAssistantPersonality["kTheYardAssistant"] = "TheYardAssistant";
    EAssistantPersonality["kDemoAssistant"] = "DemoAssistant";
})(EAssistantPersonality || (exports.EAssistantPersonality = EAssistantPersonality = {}));
/**
 * An enumeration of possible user roles.
 * Used to specify the role of the user within a facility
 */
var EUserRole;
(function (EUserRole) {
    EUserRole["kArchived"] = "archived";
    EUserRole["kGuest"] = "guest";
    EUserRole["kMember"] = "member";
    EUserRole["kAdmin"] = "admin";
})(EUserRole || (exports.EUserRole = EUserRole = {}));
/**
 * An enumeration of possible login providers.
 * Used to specify the provider of the user's login credentials
 */
var ELoginProvider;
(function (ELoginProvider) {
    ELoginProvider["kGoogle"] = "google";
})(ELoginProvider || (exports.ELoginProvider = ELoginProvider = {}));
/**
 * An enumeration of possible interstitial prompts.
 * Used to specify the prompt for the interstitial prompt when the user logs in e.g. a marketing survey or broadcast message
 */
var EShowInterstitialPrompt;
(function (EShowInterstitialPrompt) {
    EShowInterstitialPrompt["kNone"] = "none";
    EShowInterstitialPrompt["kFeedbackSurvey"] = "feedbackSurvey";
    EShowInterstitialPrompt["kBroadcast"] = "broadcast";
})(EShowInterstitialPrompt || (exports.EShowInterstitialPrompt = EShowInterstitialPrompt = {}));
/**
 * A response from the assistant chat API.
 * Contains the assistant's response classificataion for screening checks.
 */
var EScreeningClassification;
(function (EScreeningClassification) {
    EScreeningClassification["kGreeting"] = "greeting";
    EScreeningClassification["kOnTopic"] = "onTopic";
    EScreeningClassification["kOffTopic"] = "offTopic";
})(EScreeningClassification || (exports.EScreeningClassification = EScreeningClassification = {}));
;
