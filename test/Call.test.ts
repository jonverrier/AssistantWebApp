/**
 * Tests for the Call module that handles API communication with the assistant chat service.
 */
// Copyright (c) Jon Verrier, 2025


import { expect } from 'expect';
import sinon from 'sinon';
import { sandbox } from './setup';

import { EApiEvent } from '../src/UIStateMachine';
import { 
    IAssistantChatRequest, 
    EAssistantPersonality,
    EScreeningClassification 
} from '../import/AssistantChatApiTypes';
import { processChat } from '../src/Call';

const sessionId = '1234567890';

describe('processChat', function() {
    // Increase timeout to 10000ms
    this.timeout(10000);

    let mockUpdateState: sinon.SinonSpy;
    let mockApiClient: { post: sinon.SinonStub };

    beforeEach(() => {
        // Reset the stubs before each test
        sandbox.reset();
        mockUpdateState = sandbox.spy();
        mockApiClient = {
            post: sandbox.stub()
        };
    });

    afterEach(() => {
        sandbox.reset();
    });

    it('should process a valid chat request successfully', async () => {
        const screenResponse = {
            data: {
                type: EScreeningClassification.kOnTopic
            }
        };

        mockApiClient.post
            .withArgs('http://screening-api-endpoint', sinon.match.any)
            .resolves(screenResponse);

        const chatResponse = { data: "Here's a detailed plan to improve your CrossFit performance..." };

        mockApiClient.post
            .withArgs('http://chat-api-endpoint', sinon.match.any)
            .resolves(chatResponse);

        const result = await processChat({
            screeningApiUrl: 'http://screening-api-endpoint',
            chatApiUrl: 'http://chat-api-endpoint',
            input: 'What is the best way to improve my CrossFit performance?',
            personality: EAssistantPersonality.kMastersAdviser,
            sessionId: sessionId,
            updateState: mockUpdateState,
            apiClient: mockApiClient
        });

        expect(mockApiClient.post.firstCall.args[0]).toBe('http://screening-api-endpoint');
        
        const sentRequest = mockApiClient.post.firstCall.args[1] as IAssistantChatRequest;
        expect(sentRequest.personality).toBe(EAssistantPersonality.kMastersAdviser);
        expect(sentRequest.input).toBe('What is the best way to improve my CrossFit performance?');
        expect(sentRequest.sessionId).toBe(sessionId);
        
        expect(result).toBe(chatResponse.data);
        expect(mockUpdateState.callCount).toBe(4);
        expect(mockUpdateState.getCall(0).args[0]).toBe(EApiEvent.kStartedScreening);
        expect(mockUpdateState.getCall(1).args[0]).toBe(EApiEvent.kPassedScreening);
        expect(mockUpdateState.getCall(2).args[0]).toBe(EApiEvent.kStartedChat);
        expect(mockUpdateState.getCall(3).args[0]).toBe(EApiEvent.kFinishedChat);
    });

    it('should handle API errors gracefully', async () => {
        const error = new Error('API Error');
        mockApiClient.post.rejects(error);

        const result = await processChat({
            screeningApiUrl: 'http://screening-api-endpoint',
            chatApiUrl: 'http://chat-api-endpoint',
            input: 'What is the best way to improve my CrossFit performance?',
            personality: EAssistantPersonality.kMastersAdviser,
            sessionId: sessionId,
            updateState: mockUpdateState,
            apiClient: mockApiClient
        });

        expect(result).toBeUndefined();
        expect(mockUpdateState.callCount).toBe(2);
        expect(mockUpdateState.getCall(0).args[0]).toBe(EApiEvent.kStartedScreening);
        expect(mockUpdateState.getCall(1).args[0]).toBe(EApiEvent.kError);
    });

    it('should handle off-topic chat appropriately', async () => {
        const chatResponse = {
            data: {
                type: EScreeningClassification.kOffTopic
            }
        };

        mockApiClient.post
            .withArgs('http://screening-api-endpoint', sinon.match.any)
            .resolves(chatResponse);

        const result = await processChat({
            screeningApiUrl: 'http://screening-api-endpoint',
            chatApiUrl: 'http://chat-api-endpoint',
            input: 'Tell me about cake recipes',
            personality: EAssistantPersonality.kMastersAdviser,
            sessionId: sessionId,
            updateState: mockUpdateState,
            apiClient: mockApiClient
        });

        expect(mockApiClient.post.firstCall.args[0]).toBe('http://screening-api-endpoint');
        expect(result).toBeUndefined();
        expect(mockUpdateState.callCount).toBe(2);
        expect(mockUpdateState.getCall(0).args[0]).toBe(EApiEvent.kStartedScreening);
        expect(mockUpdateState.getCall(1).args[0]).toBe(EApiEvent.kRejectedFromScreening);
    });
});




