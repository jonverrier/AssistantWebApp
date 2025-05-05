/**
 * Tests for the ChatHistory module that handles API communication for retrieving chat history.
 */
// Copyright (c) Jon Verrier, 2025

import { expect } from 'expect';
import sinon from 'sinon';
import { sandbox } from './setup';

import { EApiEvent } from '../src/UIStateMachine';
import { 
    IChatMessage,
    EChatRole
} from '../import/AssistantChatApiTypes';
import { processChatHistory } from '../src/ChatHistory';

const sessionId = '1234567890';

describe('ChatHistory', function() {
    // Increase timeout to 10000ms
    this.timeout(10000);

    let mockApi: { post: sinon.SinonStub };

    beforeEach(() => {
        // Reset the stubs before each test
        sandbox.reset();
        mockApi = {
            post: sandbox.stub()
        };
    });

    afterEach(() => {
        sandbox.reset();
    });

    it('should process chat history with pagination successfully', async () => {
        // Mock responses for two pages of messages
        const firstPageResponse = {
            data: {
                messages: [
                    {
                        role: EChatRole.kUser,
                        content: 'First user message',
                        timestamp: new Date('2024-01-01T10:00:00Z')
                    },
                    {
                        role: EChatRole.kAssistant,
                        content: 'First assistant response',
                        timestamp: new Date('2024-01-01T10:00:05Z')
                    }
                ],
                continuation: 'page2'
            }
        };

        const secondPageResponse = {
            data: {
                messages: [
                    {
                        role: EChatRole.kUser,
                        content: 'Second user message',
                        timestamp: new Date('2024-01-01T10:01:00Z')
                    },
                    {
                        role: EChatRole.kAssistant,
                        content: 'Second assistant response',
                        timestamp: new Date('2024-01-01T10:01:05Z')
                    }
                ],
                continuation: undefined
            }
        };

        // Set up the mock to return different responses based on continuation token
        mockApi.post
            .withArgs('http://chat-history-api-endpoint', sinon.match({ continuation: undefined }))
            .resolves(firstPageResponse);

        mockApi.post
            .withArgs('http://chat-history-api-endpoint', sinon.match({ continuation: 'page2' }))
            .resolves(secondPageResponse);

        // Track received pages
        const receivedPages: IChatMessage[][] = [];

        const result = await processChatHistory({
            chatHistoryApiUrl: 'http://chat-history-api-endpoint',
            sessionId: sessionId,
            limit: 2,
            apiClient: mockApi,
            onPage: (messages) => {
                receivedPages.push(messages);
            }
        });

        // Verify API calls
        expect(mockApi.post.callCount).toBe(2);
        
        // Verify first request
        const firstRequest = mockApi.post.firstCall.args[1];
        expect(firstRequest.sessionId).toBe(sessionId);
        expect(firstRequest.limit).toBe(2);
        expect(firstRequest.continuation).toBeUndefined();

        // Verify second request
        const secondRequest = mockApi.post.secondCall.args[1];
        expect(secondRequest.sessionId).toBe(sessionId);
        expect(secondRequest.limit).toBe(2);
        expect(secondRequest.continuation).toBe('page2');

        // Verify received pages
        expect(receivedPages.length).toBe(2);
        expect(receivedPages[0].length).toBe(2);
        expect(receivedPages[1].length).toBe(2);

        // Verify final result
        expect(result).toBeDefined();
        expect(result?.length).toBe(4);
        expect(result?.[0].content).toBe('First user message');
        expect(result?.[1].content).toBe('First assistant response');
        expect(result?.[2].content).toBe('Second user message');
        expect(result?.[3].content).toBe('Second assistant response');
    });

    it('should handle API errors gracefully', async () => {
        const error = new Error('API Error');
        mockApi.post.rejects(error);

        const result = await processChatHistory({
            chatHistoryApiUrl: 'http://chat-history-api-endpoint',
            sessionId: sessionId,
            limit: 2,
            apiClient: mockApi
        });

        expect(result).toBeUndefined();
    });

    it('should handle empty chat history', async () => {
        const emptyResponse = {
            data: {
                messages: [],
                continuation: undefined
            }
        };

        mockApi.post.resolves(emptyResponse);

        const result = await processChatHistory({
            chatHistoryApiUrl: 'http://chat-history-api-endpoint',
            sessionId: sessionId,
            limit: 2,
            apiClient: mockApi
        });

        expect(result).toEqual([]);
    });
}); 