"use strict";
/**
 * Tests for the Call module that handles API communication with the requirements linter service.
 */
// Copyright (c) Jon Verrier, 2025
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expect_1 = require("expect");
const sinon_1 = __importDefault(require("sinon"));
const setup_1 = require("./setup");
const UIStateMachine_1 = require("../src/UIStateMachine");
const Call_1 = require("../src/Call");
const UIStrings_1 = require("../src/UIStrings");
const sessionId = '1234567890';
let linterModes = [UIStrings_1.ELinterMode.Requirement, UIStrings_1.ELinterMode.UserStory];
describe('processRequirement', function () {
    // Increase timeout to 10000ms
    this.timeout(10000);
    let mockUpdateState;
    let mockApiClient;
    beforeEach(() => {
        // Reset the stubs before each test
        setup_1.sandbox.reset();
        mockUpdateState = setup_1.sandbox.spy();
        mockApiClient = {
            post: setup_1.sandbox.stub()
        };
    });
    afterEach(() => {
        setup_1.sandbox.reset();
    });
    it('should process a valid requirement successfully', async () => {
        // Setup mock responses
        const quickCheckResponse = { data: { isSpecification: true } };
        const evaluationResponse = {
            data: {
                evaluation: 'Good requirement',
                proposedNewRequirement: 'Improved requirement'
            }
        };
        // Configure stub behavior
        mockApiClient.post
            .withArgs('http://quick-check', sinon_1.default.match.any)
            .resolves(quickCheckResponse);
        mockApiClient.post
            .withArgs('http://evaluation', sinon_1.default.match.any)
            .resolves(evaluationResponse);
        const result = await (0, Call_1.processRequirement)({
            quickCheckUrl: 'http://quick-check',
            evaluationUrl: 'http://evaluation',
            specification: 'The system shall do X',
            updateState: mockUpdateState,
            apiClient: mockApiClient,
            sessionId: sessionId
        });
        // Verify post was called with correct arguments
        (0, expect_1.expect)(mockApiClient.post.calledTwice).toBe(true);
        (0, expect_1.expect)(mockApiClient.post.firstCall.args[0]).toBe('http://quick-check');
        (0, expect_1.expect)(mockApiClient.post.secondCall.args[0]).toBe('http://evaluation');
        (0, expect_1.expect)(result).toEqual(evaluationResponse.data);
        (0, expect_1.expect)(mockUpdateState.callCount).toBe(4);
        (0, expect_1.expect)(mockUpdateState.getCall(0).args[0]).toBe(UIStateMachine_1.EApiEvent.StartedCheck);
        (0, expect_1.expect)(mockUpdateState.getCall(1).args[0]).toBe(UIStateMachine_1.EApiEvent.PassedCheck);
        (0, expect_1.expect)(mockUpdateState.getCall(2).args[0]).toBe(UIStateMachine_1.EApiEvent.StartedLint);
        (0, expect_1.expect)(mockUpdateState.getCall(3).args[0]).toBe(UIStateMachine_1.EApiEvent.Linted);
    });
    it('should return undefined for non-requirement statements', async () => {
        mockApiClient.post.resolves({ data: { isSpecification: false } });
        const result = await (0, Call_1.processRequirement)({
            quickCheckUrl: 'http://quick-check',
            evaluationUrl: 'http://evaluation',
            specification: 'This is not a requirement',
            updateState: mockUpdateState,
            apiClient: mockApiClient,
            sessionId: sessionId
        });
        (0, expect_1.expect)(mockApiClient.post.calledOnce).toBe(true);
        (0, expect_1.expect)(result).toBeUndefined();
        (0, expect_1.expect)(mockUpdateState.callCount).toBe(2);
        (0, expect_1.expect)(mockUpdateState.getCall(0).args[0]).toBe(UIStateMachine_1.EApiEvent.StartedCheck);
        (0, expect_1.expect)(mockUpdateState.getCall(1).args[0]).toBe(UIStateMachine_1.EApiEvent.RejectedCheck);
    });
    it('should handle API errors gracefully', async () => {
        const error = new Error('API Error');
        mockApiClient.post.rejects(error);
        const result = await (0, Call_1.processRequirement)({
            quickCheckUrl: 'http://quick-check',
            evaluationUrl: 'http://evaluation',
            specification: 'The system shall do X',
            updateState: mockUpdateState,
            apiClient: mockApiClient,
            sessionId: sessionId
        });
        (0, expect_1.expect)(result).toBeUndefined();
        (0, expect_1.expect)(mockUpdateState.callCount).toBe(2);
        (0, expect_1.expect)(mockUpdateState.getCall(0).args[0]).toBe(UIStateMachine_1.EApiEvent.StartedCheck);
        (0, expect_1.expect)(mockUpdateState.getCall(1).args[0]).toBe(UIStateMachine_1.EApiEvent.Error);
    });
    it('should handle evaluation API errors gracefully', async () => {
        const error = new Error('Evaluation API Error');
        mockApiClient.post
            .withArgs('http://quick-check', sinon_1.default.match.any)
            .resolves({ data: { isRequirement: true } });
        mockApiClient.post
            .withArgs('http://evaluation', sinon_1.default.match.any)
            .rejects(error);
        const result = await (0, Call_1.processRequirement)({
            quickCheckUrl: 'http://quick-check',
            evaluationUrl: 'http://evaluation',
            specification: 'The system shall do X',
            updateState: mockUpdateState,
            apiClient: mockApiClient,
            sessionId: sessionId
        });
        (0, expect_1.expect)(result).toBeUndefined();
        (0, expect_1.expect)(mockUpdateState.callCount).toBe(2);
        (0, expect_1.expect)(mockUpdateState.getCall(0).args[0]).toBe(UIStateMachine_1.EApiEvent.StartedCheck);
        (0, expect_1.expect)(mockUpdateState.getCall(1).args[0]).toBe(UIStateMachine_1.EApiEvent.RejectedCheck);
    });
});
for (let linterMode of linterModes) {
    describe(`API Integration for ${linterMode}`, function () {
        // Increase timeout to 10000ms
        this.timeout(30000);
        let mockUpdateState;
        mockUpdateState = setup_1.sandbox.spy();
        it('should successfully call the API', async () => {
            const quickCheckUrl = linterMode === UIStrings_1.ELinterMode.UserStory ?
                'http://localhost:7071/api/QuickCheckUserStory' :
                'http://localhost:7071/api/QuickCheckRequirement';
            const evaluateUrl = linterMode === UIStrings_1.ELinterMode.UserStory ?
                'http://localhost:7071/api/EvaluateUserStory' :
                'http://localhost:7071/api/EvaluateRequirement';
            const testRequirement = linterMode === UIStrings_1.ELinterMode.UserStory ?
                'As a user, I want fast responses so that I can work efficiently' :
                'The system shall process user input within 2 seconds';
            const result = await (0, Call_1.processRequirement)({
                quickCheckUrl: quickCheckUrl,
                evaluationUrl: evaluateUrl,
                specification: testRequirement,
                updateState: mockUpdateState,
                apiClient: undefined,
                sessionId: sessionId
            });
            (0, expect_1.expect)(result).toBeDefined();
        });
    });
}
