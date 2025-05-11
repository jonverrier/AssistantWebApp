/**
 * This is the state machine for the assistant UI.
 * It is responsible for handling the state transitions and events.
 */
export declare enum EUIState {
    kWaiting = "Waiting",
    kScreening = "Screening",
    kChatting = "Chatting",
    kOffTopic = "OffTopic",
    kError = "Error",
    kArchiving = "Archiving"
}
export declare enum EApiEvent {
    kStartedScreening = "StartedScreening",
    kStartedChat = "StartedChat",
    kRejectedFromScreening = "RejectedFromScreening",
    kPassedScreening = "PassedScreening",
    kFinishedChat = "FinishedChat",
    kError = "Error",
    kReset = "Reset",
    kStartedArchiving = "StartedArchiving",
    kFinishedArchiving = "FinishedArchiving"
}
export declare class AssistantUIStateMachine {
    private state;
    constructor(initialState: EUIState);
    transition(event: EApiEvent): void;
    getState(): EUIState;
}
//# sourceMappingURL=UIStateMachine.d.ts.map