"use strict";
/**
 * This is the state machine for the assistant UI.
 * It is responsible for handling the state transitions and events.
 */
// Copyright Jon Verrier, 2025
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantUIStateMachine = exports.EApiEvent = exports.EUIState = void 0;
var EUIState;
(function (EUIState) {
    EUIState["kWaiting"] = "Waiting";
    EUIState["kScreening"] = "Screening";
    EUIState["kChatting"] = "Chatting";
    EUIState["kOffTopic"] = "OffTopic";
    EUIState["kError"] = "Error";
})(EUIState || (exports.EUIState = EUIState = {}));
var EApiEvent;
(function (EApiEvent) {
    EApiEvent["kStartedScreening"] = "StartedScreening";
    EApiEvent["kStartedChat"] = "StartedChat";
    EApiEvent["kRejectedFromScreening"] = "RejectedFromScreening";
    EApiEvent["kPassedScreening"] = "PassedScreening";
    EApiEvent["kFinishedChat"] = "FinishedChat";
    EApiEvent["kError"] = "Error";
    EApiEvent["kReset"] = "Reset";
})(EApiEvent || (exports.EApiEvent = EApiEvent = {}));
class AssistantUIStateMachine {
    state;
    constructor(initialState) {
        this.state = initialState;
    }
    transition(event) {
        switch (this.state) {
            case EUIState.kWaiting:
                if (event === EApiEvent.kStartedScreening) {
                    this.state = EUIState.kScreening;
                }
                else if (event === EApiEvent.kReset) {
                    this.state = EUIState.kWaiting;
                }
                else {
                    throw new Error(`Invalid state change: Cannot transition from ${this.state} with event ${event}`);
                }
                break;
            case EUIState.kScreening:
                if (event === EApiEvent.kPassedScreening) {
                    this.state = EUIState.kChatting;
                }
                else if (event === EApiEvent.kRejectedFromScreening) {
                    this.state = EUIState.kOffTopic;
                }
                else if (event === EApiEvent.kError) {
                    this.state = EUIState.kError;
                }
                else {
                    throw new Error(`Invalid state change: Cannot transition from ${this.state} with event ${event}`);
                }
                break;
            case EUIState.kChatting:
                if (event === EApiEvent.kFinishedChat) {
                    this.state = EUIState.kWaiting;
                }
                else if (event === EApiEvent.kError) {
                    this.state = EUIState.kError;
                }
                else if (event === EApiEvent.kStartedChat) {
                    // This is a no-op - we actually go to Linting after PassedCheck
                    this.state = EUIState.kChatting;
                }
                else {
                    throw new Error(`Invalid state change: Cannot transition from ${this.state} with event ${event}`);
                }
                break;
            case EUIState.kOffTopic:
                if (event === EApiEvent.kReset) {
                    this.state = EUIState.kWaiting;
                }
                else if (event === EApiEvent.kError) {
                    this.state = EUIState.kError;
                }
                else {
                    throw new Error(`Invalid state change: Cannot transition from ${this.state} with event ${event}`);
                }
                break;
            case EUIState.kError:
                if (event === EApiEvent.kReset) {
                    this.state = EUIState.kWaiting;
                }
                else {
                    throw new Error(`Invalid state change: Cannot transition from ${this.state} with event ${event}`);
                }
                break;
            default:
                throw new Error(`Unknown state: ${this.state}`);
        }
    }
    getState() {
        return this.state;
    }
}
exports.AssistantUIStateMachine = AssistantUIStateMachine;
