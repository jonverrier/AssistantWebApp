"use strict";
/**
 * @module AssistantChatApiTypes
 *
 * Type definitions and interfaces for the assistant chat API.
 * Includes types for chat requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EScreeningClassification = exports.EAssistantPersonality = void 0;
/**
 * An enumeration of possible assistant personalities.
 * Used to specify the desired personality type for chat interactions.
 */
var EAssistantPersonality;
(function (EAssistantPersonality) {
    EAssistantPersonality["kMastersAdviser"] = "MastersAdviser";
    EAssistantPersonality["kGeneralAdvisor"] = "GeneralAdvisor";
})(EAssistantPersonality || (exports.EAssistantPersonality = EAssistantPersonality = {}));
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
