/**
 * Tests for the UI state machine that manages transitions between states.
 */

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
    it('should transition from Waiting to Screening on StartedScreening', () => {
      stateMachine.transition(EApiEvent.kStartedScreening);
      expect(stateMachine.getState()).toBe(EUIState.kScreening);
    });

    it('should transition from Screening to Chatting on PassedScreening', () => {
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
    
    it('should transition from Waiting to Loading on StartedLoading', () => {
      stateMachine.transition(EApiEvent.kStartedLoading);
      expect(stateMachine.getState()).toBe(EUIState.kLoading);
    });

    it('should transition from Loading to Waiting on FinishedLoading', () => {
      stateMachine.transition(EApiEvent.kStartedLoading);
      stateMachine.transition(EApiEvent.kFinishedLoading);
      expect(stateMachine.getState()).toBe(EUIState.kWaiting);
    });

    it('should transition from Loading to Waiting on Reset', () => {
      stateMachine.transition(EApiEvent.kStartedLoading);
      stateMachine.transition(EApiEvent.kReset);
      expect(stateMachine.getState()).toBe(EUIState.kWaiting);
    });
  });
}); 