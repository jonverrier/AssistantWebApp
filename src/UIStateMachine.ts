/**
 * This is the state machine for the assistant UI.
 * It is responsible for handling the state transitions and events.
 */
// Copyright Jon Verrier, 2025

export enum EUIState {
   kWaiting = 'Waiting',
   kScreening = 'Screening',
   kChatting = 'Chatting',
   kOffTopic = 'OffTopic',
   kError = 'Error',
   kArchiving = 'Archiving'
}

export enum EApiEvent {
   kStartedScreening = 'StartedScreening',
   kStartedChat = 'StartedChat',
   kRejectedFromScreening = 'RejectedFromScreening',
   kPassedScreening = 'PassedScreening',
   kFinishedChat = 'FinishedChat',
   kError = 'Error',
   kReset = 'Reset',
   kStartedArchiving = 'StartedArchiving',
   kFinishedArchiving = 'FinishedArchiving'
}

export class AssistantUIStateMachine {
   private state: EUIState;

   constructor(initialState: EUIState) {
      this.state = initialState;
   }

   public transition(event: EApiEvent): void {
      switch (this.state) {
         case EUIState.kWaiting:
            if (event === EApiEvent.kStartedScreening) {
               this.state = EUIState.kScreening;
            }
            else if (event === EApiEvent.kReset) {
               this.state = EUIState.kWaiting;
            }
            else if (event === EApiEvent.kStartedArchiving) {
               this.state = EUIState.kArchiving;
            }
            else {
               throw new Error(`Invalid state change: Cannot transition from ${this.state} with event ${event}`);
            }
            break;
         case EUIState.kScreening:
            if (event === EApiEvent.kPassedScreening) {
               this.state = EUIState.kChatting;
            }
            else
            if (event === EApiEvent.kRejectedFromScreening) {
               this.state = EUIState.kOffTopic;
            }
            else
            if (event === EApiEvent.kError) {
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
            else
            if (event === EApiEvent.kError) {
               this.state = EUIState.kError;
            }
            else
            if (event === EApiEvent.kStartedChat) {
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
            else
            if (event === EApiEvent.kError) {
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
         case EUIState.kArchiving:
            if (event === EApiEvent.kFinishedArchiving) {
               this.state = EUIState.kWaiting;
            }
            else if (event === EApiEvent.kError) {
               this.state = EUIState.kError;
            }
            else {
               throw new Error(`Invalid state change: Cannot transition from ${this.state} with event ${event}`);
            }
            break;
         default:
            throw new Error(`Unknown state: ${this.state}`);
      }
   }

   public getState(): EUIState {
      return this.state;
   }
}
