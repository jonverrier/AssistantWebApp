"use strict";
/**
 * @module AssistantChatApiTypes
 *
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */
// Copyright (c) 2025 Jon Verrier
Object.defineProperty(exports, "__esModule", { value: true });
exports.EScreeningClassification = exports.EUserRole = exports.EAssistantPersonality = void 0;
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
    EUserRole["kOnboarding"] = "onboarding";
    EUserRole["kMember"] = "member";
    EUserRole["kAdmin"] = "admin";
})(EUserRole || (exports.EUserRole = EUserRole = {}));
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
