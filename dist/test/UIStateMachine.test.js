"use strict";
/**
 * Tests for the UI state machine that manages transitions between linting states.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright Jon Verrier, 2025
const expect_1 = require("expect");
const UIStateMachine_1 = require("../src/UIStateMachine");
describe('LinterUIStateMachine', () => {
    let stateMachine;
    beforeEach(() => {
        stateMachine = new UIStateMachine_1.LinterUIStateMachine(UIStateMachine_1.EUIState.Waiting);
    });
    describe('initial state', () => {
        it('should start in Waiting state', () => {
            (0, expect_1.expect)(stateMachine.getState()).toBe(UIStateMachine_1.EUIState.Waiting);
        });
    });
    describe('state transitions', () => {
        it('should transition from Waiting to Checking on StartedCheck', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            (0, expect_1.expect)(stateMachine.getState()).toBe(UIStateMachine_1.EUIState.Checking);
        });
        it('should transition from Checking to Linting on PassedCheck', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.PassedCheck);
            (0, expect_1.expect)(stateMachine.getState()).toBe(UIStateMachine_1.EUIState.Linting);
        });
        it('should transition from Checking to NotARequirement on RejectedCheck', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.RejectedCheck);
            (0, expect_1.expect)(stateMachine.getState()).toBe(UIStateMachine_1.EUIState.NotARequirement);
        });
        it('should transition from Linting back to Waiting on Linted', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.PassedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.Linted);
            (0, expect_1.expect)(stateMachine.getState()).toBe(UIStateMachine_1.EUIState.Waiting);
        });
        it('should transition from NotARequirement to Waiting on Reset', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.RejectedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.Reset);
            (0, expect_1.expect)(stateMachine.getState()).toBe(UIStateMachine_1.EUIState.Waiting);
        });
        it('should transition from Checking to Error on Error', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.Error);
            (0, expect_1.expect)(stateMachine.getState()).toBe(UIStateMachine_1.EUIState.Error);
        });
        it('should transition from Linting to Error on Error', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.PassedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.Error);
            (0, expect_1.expect)(stateMachine.getState()).toBe(UIStateMachine_1.EUIState.Error);
        });
    });
    describe('error handling', () => {
        it('should throw error on invalid transition from Waiting', () => {
            (0, expect_1.expect)(() => stateMachine.transition(UIStateMachine_1.EApiEvent.PassedCheck))
                .toThrow(`Invalid state change: Cannot transition from ${UIStateMachine_1.EUIState.Waiting} with event ${UIStateMachine_1.EApiEvent.PassedCheck}`);
        });
        it('should throw error on invalid transition from Checking', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            (0, expect_1.expect)(() => stateMachine.transition(UIStateMachine_1.EApiEvent.Linted))
                .toThrow(`Invalid state change: Cannot transition from ${UIStateMachine_1.EUIState.Checking} with event ${UIStateMachine_1.EApiEvent.Linted}`);
        });
        it('should throw error on invalid transition from Linting', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.PassedCheck);
            (0, expect_1.expect)(() => stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck))
                .toThrow(`Invalid state change: Cannot transition from ${UIStateMachine_1.EUIState.Linting} with event ${UIStateMachine_1.EApiEvent.StartedCheck}`);
        });
        it('should throw error on invalid transition from NotARequirement', () => {
            stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck);
            stateMachine.transition(UIStateMachine_1.EApiEvent.RejectedCheck);
            (0, expect_1.expect)(() => stateMachine.transition(UIStateMachine_1.EApiEvent.StartedCheck))
                .toThrow(`Invalid state change: Cannot transition from ${UIStateMachine_1.EUIState.NotARequirement} with event ${UIStateMachine_1.EApiEvent.StartedCheck}`);
        });
    });
});
