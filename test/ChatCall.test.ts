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
import { processChat } from '../src/ChatCall';

const sessionId = '1234567890';

interface MockResponse {
    status: number;
    headers: {
        'content-type': string;
    };
    data: ReadableStream<Uint8Array> | string;
}

describe('processChat', function() {
    // Increase timeout to 10000ms
    this.timeout(10000);

    let mockUpdateState: sinon.SinonSpy;
    let mockApi: { post: sinon.SinonStub };

    beforeEach(() => {
        // Reset the stubs before each test
        sandbox.reset();
        mockUpdateState = sandbox.spy();
        mockApi = {
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

        mockApi.post
            .withArgs('http://screening-api-endpoint', sinon.match.any)
            .resolves(screenResponse);

        // Track received chunks and progress events
        const receivedChunks: string[] = [];
        const progressEvents: any[] = [];

        // Create a promise that resolves when the last chunk is received
        let resolveLastChunk: () => void;
        const lastChunkReceived = new Promise<void>(resolve => {
            resolveLastChunk = resolve;
        });

        const chunks = [
            'data: "Here\'s a detailed"\n\n',
            'data: " plan to improve"\n\n',
            'data: " your CrossFit performance..."\n\n',
            'data: [DONE]\n\n'
        ];

        let accumulatedResponse = '';

        // Mock the Axios streaming response
        mockApi.post
            .withArgs('http://chat-api-endpoint', sinon.match.any)
            .callsFake((url, data, config) => {
                // Start a background process to simulate streaming
                setTimeout(async () => {
                    for (let i = 0; i < chunks.length; i++) {
                        accumulatedResponse += chunks[i];
                        if (config?.onDownloadProgress) {
                            // Simulate XHR progress event
                            config.onDownloadProgress({
                                loaded: accumulatedResponse.length,
                                total: chunks.join('').length,
                                progress: (i + 1) / chunks.length,
                                event: {
                                    target: {
                                        response: accumulatedResponse
                                    }
                                }
                            });
                        }

                        if (i === chunks.length - 1) {
                            resolveLastChunk();
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }, 0);

                return Promise.resolve({
                    status: 200,
                    headers: {
                        'content-type': 'text/event-stream'
                    },
                    data: ''  // Initial response is empty, data comes through progress events
                });
            });

        const result = await processChat({
            screeningApiUrl: 'http://screening-api-endpoint',
            chatApiUrl: 'http://chat-api-endpoint',
            input: 'What is the best way to improve my CrossFit performance?',
            personality: EAssistantPersonality.kMastersAdviser,
            sessionId: sessionId,
            updateState: mockUpdateState,
            apiClient: mockApi,
            onChunk: (chunk) => {
                receivedChunks.push(chunk);
                expect(chunk).toBeTruthy();
            }
        });

        // Wait for all chunks to be processed
        await lastChunkReceived;

        expect(mockApi.post.firstCall.args[0]).toBe('http://screening-api-endpoint');
        
        const sentRequest = mockApi.post.firstCall.args[1] as IAssistantChatRequest;
        expect(sentRequest.personality).toBe(EAssistantPersonality.kMastersAdviser);
        expect(sentRequest.input).toBe('What is the best way to improve my CrossFit performance?');
        expect(sentRequest.sessionId).toBe(sessionId);
        
        // Verify chunks were received
        expect(receivedChunks.length).toBe(3); // 3 content chunks (excluding [DONE])
        expect(receivedChunks[0]).toContain("Here's a detailed");
        expect(receivedChunks[1]).toContain("plan to improve");
        expect(receivedChunks[2]).toContain("your CrossFit performance");

        // Verify onDownloadProgress was called with proper event structure
        const chatRequestConfig = mockApi.post.lastCall.args[2];
        expect(chatRequestConfig).toBeDefined();
        expect(typeof chatRequestConfig.onDownloadProgress).toBe('function');
        
        expect(mockUpdateState.callCount).toBe(4);
        expect(mockUpdateState.getCall(0).args[0]).toBe(EApiEvent.kStartedScreening);
        expect(mockUpdateState.getCall(1).args[0]).toBe(EApiEvent.kPassedScreening);
        expect(mockUpdateState.getCall(2).args[0]).toBe(EApiEvent.kStartedChat);
        expect(mockUpdateState.getCall(3).args[0]).toBe(EApiEvent.kFinishedChat);
    });

    it('should handle API errors gracefully', async () => {
        const error = new Error('API Error');
        mockApi.post.rejects(error);

        const result = await processChat({
            screeningApiUrl: 'http://screening-api-endpoint',
            chatApiUrl: 'http://chat-api-endpoint',
            input: 'What is the best way to improve my CrossFit performance?',
            personality: EAssistantPersonality.kMastersAdviser,
            sessionId: sessionId,
            updateState: mockUpdateState,
            apiClient: mockApi
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

        mockApi.post
            .withArgs('http://screening-api-endpoint', sinon.match.any)
            .resolves(chatResponse);

        const result = await processChat({
            screeningApiUrl: 'http://screening-api-endpoint',
            chatApiUrl: 'http://chat-api-endpoint',
            input: 'Tell me about cake recipes',
            personality: EAssistantPersonality.kMastersAdviser,
            sessionId: sessionId,
            updateState: mockUpdateState,
            apiClient: mockApi
        });

        expect(mockApi.post.firstCall.args[0]).toBe('http://screening-api-endpoint');
        expect(result).toBeUndefined();
        expect(mockUpdateState.callCount).toBe(2);
        expect(mockUpdateState.getCall(0).args[0]).toBe(EApiEvent.kStartedScreening);
        expect(mockUpdateState.getCall(1).args[0]).toBe(EApiEvent.kRejectedFromScreening);
    });
});




