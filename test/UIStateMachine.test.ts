/**
 * Tests for the UI state machine that manages transitions between linting states.
 */

// Copyright Jon Verrier, 2025


import { expect } from 'expect';
import { AssistantUIStateMachine, EUIState, EApiEvent } from '../src/UIStateMachine';

describe('AssistantUIStateMachine', () => {
  let stateMachine: AssistantUIStateMachine;

  beforeEach(() => {
    stateMachine = new AssistantUIStateMachine(EUIState.kWaiting);
  });

  describe('initial state', () => {
    it('should start in Waiting state', () => {
      expect(stateMachine.getState()).toBe(EUIState.kWaiting);
    });
  });

  describe('state transitions', () => {
    it('should transition from Waiting to Screening on StartedScreen', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      expect(stateMachine.getState()).toBe(EUIState.kScreening);
    });

    it('should transition from Screening to Chatting on PassedScreen', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      stateMachine.transition(EApiEvent.kPassedScreening);
      expect(stateMachine.getState()).toBe(EUIState.kChatting);
    });

    it('should transition from Screening to OffTopic on RejectedFromScreening', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      stateMachine.transition(EApiEvent.kRejectedFromScreening);
      expect(stateMachine.getState()).toBe(EUIState.kOffTopic);
    });

    it('should transition from Chatting back to Waiting on FinishedChat', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      stateMachine.transition(EApiEvent.kPassedScreening);
      stateMachine.transition(EApiEvent.kFinishedChat);
      expect(stateMachine.getState()).toBe(EUIState.kWaiting);
    });

    it('should transition from OffTopic to Waiting on Reset', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      stateMachine.transition(EApiEvent.kRejectedFromScreening);
      stateMachine.transition(EApiEvent.kReset);
      expect(stateMachine.getState()).toBe(EUIState.kWaiting);
    });

    it('should transition from Screening to Error on Error', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      stateMachine.transition(EApiEvent.kError);
      expect(stateMachine.getState()).toBe(EUIState.kError);
    }); 
    
    it('should transition from Chatting to Error on Error', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      stateMachine.transition(EApiEvent.kPassedScreening);
      stateMachine.transition(EApiEvent.kError);
      expect(stateMachine.getState()).toBe(EUIState.kError);
    });      
  });

  describe('error handling', () => {
    it('should throw error on invalid transition from Waiting', () => {
      expect(() => stateMachine.transition(EApiEvent.kPassedScreening))
        .toThrow(`Invalid state change: Cannot transition from ${EUIState.kWaiting} with event ${EApiEvent.kPassedScreening}`);
    });

    it('should throw error on invalid transition from Screening', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      expect(() => stateMachine.transition(EApiEvent.kStartedChat))
        .toThrow(`Invalid state change: Cannot transition from ${EUIState.kScreening} with event ${EApiEvent.kStartedChat}`);
    });

    it('should throw error on invalid transition from Chatting', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      stateMachine.transition(EApiEvent.kPassedScreening);
      expect(() => stateMachine.transition(EApiEvent.kStartedScreening))
        .toThrow(`Invalid state change: Cannot transition from ${EUIState.kChatting} with event ${EApiEvent.kStartedScreening}`);
    });

    it('should throw error on invalid transition from OffTopic', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      stateMachine.transition(EApiEvent.kRejectedFromScreening);
      expect(() => stateMachine.transition(EApiEvent.kStartedScreening))
        .toThrow(`Invalid state change: Cannot transition from ${EUIState.kOffTopic} with event ${EApiEvent.kStartedScreening}`);
    });
  });
}); 