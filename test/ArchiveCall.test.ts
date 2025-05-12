/**
 * Tests for the ArchiveCall module that handles archiving of chat messages.
 */
// Copyright (c) Jon Verrier, 2025

import { expect } from 'expect';
import sinon from 'sinon';
import { sandbox } from './setup';

import { EApiEvent } from '../src/UIStateMachine';
import { shouldArchive, archive } from '../src/ArchiveCall';
import { IChatMessage, EChatRole, ChatMessageClassName } from 'prompt-repository';

// Simple pseudo-UUID generator for testing
let uuidCounter = 0;
const generateTestId = () => `test-message-${++uuidCounter}`;

describe('ArchiveCall', () => {
    let mockApi: { post: sinon.SinonStub };
    let mockUpdateState: sinon.SinonStub;

    beforeEach(() => {
        sandbox.reset();
        mockApi = {
            post: sandbox.stub()
        };
        mockUpdateState = sandbox.stub();
        uuidCounter = 0; // Reset counter before each test
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('shouldArchive', () => {
        it('should return false for empty message array', () => {
            expect(shouldArchive([])).toBe(false);
        });

        it('should return true when message count exceeds threshold', () => {
            const messages: IChatMessage[] = Array(101).fill(null).map(() => ({
                id: generateTestId(),
                className: ChatMessageClassName,
                role: EChatRole.kUser,
                content: 'Test message',
                timestamp: new Date()
            }));
            expect(shouldArchive(messages)).toBe(true);
        });

        it('should return true when total tokens exceed threshold', () => {
            // Create a message that will exceed the token threshold (14*1024)
            const longContent = 'The dog swam in the stream and came home well stincky  '.repeat(14*1024/2+1024); // This should generate more than 14k tokens
            const messages: IChatMessage[] = [{
                id: generateTestId(),
                className: ChatMessageClassName,
                role: EChatRole.kUser,
                content: longContent,
                timestamp: new Date()
            }];
            expect(shouldArchive(messages)).toBe(true);
        });

        it('should return false when messages are within limits', () => {
            const messages: IChatMessage[] = Array(50).fill(null).map(() => ({
                id: generateTestId(),
                className: ChatMessageClassName,
                role: EChatRole.kUser,
                content: 'Short test message',
                timestamp: new Date()
            }));
            expect(shouldArchive(messages)).toBe(false);
        });
    });

    describe('archive', () => {
        const sessionId = '1234567890';
        const baseTimestamp = new Date('2024-01-01T00:00:00Z');
        const wordCount = 100;

        function createTestMessages(count: number): IChatMessage[] {
            return Array(count).fill(null).map((_, index) => ({
                id: generateTestId(),
                className: ChatMessageClassName,
                role: EChatRole.kUser,
                content: `Message ${index}`,
                timestamp: new Date(baseTimestamp.getTime() + index * 60000) // Each message 1 minute apart
            }));
        }

        it('should return original messages if array is empty', async () => {
            const result = await archive({
                archiveApiUrl: 'http://archive-api-endpoint',
                summarizeApiUrl: 'http://summarize-api-endpoint',
                sessionId,
                messages: [],
                wordCount,
                apiClient: mockApi,
                updateState: mockUpdateState
            });

            expect(result).toEqual([]);
            expect(mockApi.post.called).toBe(false);
        });

        it('should archive messages successfully with single page and add summary', async () => {
            const messages = createTestMessages(100);
            const midPoint = Math.floor(messages.length / 2);
            const summaryMessage: IChatMessage = {
                id: 'summary-1',
                className: ChatMessageClassName,
                role: EChatRole.kAssistant,
                content: 'Summary of archived messages',
                timestamp: new Date()
            };

            // Mock summarize API call
            mockApi.post.onFirstCall().resolves({
                data: {
                    summary: summaryMessage
                }
            });

            // Mock archive API call
            mockApi.post.onSecondCall().resolves({
                data: {
                    updatedCount: 50,
                    continuation: undefined
                }
            });

            const result = await archive({
                archiveApiUrl: 'http://archive-api-endpoint',
                summarizeApiUrl: 'http://summarize-api-endpoint',
                sessionId,
                messages,
                wordCount,
                apiClient: mockApi,
                updateState: mockUpdateState
            });

            expect(mockApi.post.calledTwice).toBe(true);
            expect(result.length).toBe(51); // 50 recent messages + 1 summary message
            expect(result[0]).toEqual(summaryMessage); // Summary should be first
            expect(result.slice(1)).toEqual(messages.slice(midPoint)); // Then recent messages
            expect(mockUpdateState.calledWith(EApiEvent.kStartedArchiving)).toBe(true);
            expect(mockUpdateState.calledWith(EApiEvent.kFinishedArchiving)).toBe(true);
        });

        it('should handle multiple pages of archiving with summary', async () => {
            const messages = createTestMessages(100);
            const summaryMessage: IChatMessage = {
                id: 'summary-1',
                className: ChatMessageClassName,
                role: EChatRole.kAssistant,
                content: 'Summary of archived messages',
                timestamp: new Date()
            };

            // Mock summarize API call
            mockApi.post.onFirstCall().resolves({
                data: {
                    summary: summaryMessage
                }
            });

            // Mock first archive page
            mockApi.post.onSecondCall().resolves({
                data: {
                    updatedCount: 25,
                    continuation: 'next-page-token'
                }
            });

            // Mock second archive page
            mockApi.post.onThirdCall().resolves({
                data: {
                    updatedCount: 25,
                    continuation: undefined
                }
            });

            const result = await archive({
                archiveApiUrl: 'http://archive-api-endpoint',
                summarizeApiUrl: 'http://summarize-api-endpoint',
                sessionId,
                messages,
                wordCount,
                apiClient: mockApi,
                updateState: mockUpdateState
            });

            expect(mockApi.post.calledThrice).toBe(true);
            expect(result.length).toBe(51); // 50 recent messages + 1 summary
            expect(mockUpdateState.calledWith(EApiEvent.kStartedArchiving)).toBe(true);

            // Verify summarize call was made first
            const summarizeCall = mockApi.post.firstCall;
            expect(summarizeCall.args[0]).toBe('http://summarize-api-endpoint');

            // Verify second archive page includes continuation token
            const secondArchiveCall = mockApi.post.thirdCall;
            expect(secondArchiveCall.args[1].continuation).toBe('next-page-token');
        });

        it('should handle summarization API errors', async () => {
            const messages = createTestMessages(100);
            const error = new Error('Summarization API Error');
            
            // Mock summarize API error
            mockApi.post.onFirstCall().rejects(error);

            const result = await archive({
                archiveApiUrl: 'http://archive-api-endpoint',
                summarizeApiUrl: 'http://summarize-api-endpoint',
                sessionId,
                messages,
                wordCount,
                apiClient: mockApi,
                updateState: mockUpdateState
            });

            expect(result).toEqual(messages); // Should return original messages
            expect(mockUpdateState.calledWith(EApiEvent.kStartedArchiving)).toBe(true);
            expect(mockUpdateState.calledWith(EApiEvent.kError)).toBe(true);
        });

        it('should handle failed archive operation', async () => {
            const messages = createTestMessages(100);
            const summaryMessage: IChatMessage = {
                id: 'summary-1',
                className: ChatMessageClassName,
                role: EChatRole.kAssistant,
                content: 'Summary of archived messages',
                timestamp: new Date()
            };

            // Mock successful summarize
            mockApi.post.onFirstCall().resolves({
                data: {
                    summary: summaryMessage
                }
            });

            // Mock failed archive
            mockApi.post.onSecondCall().resolves({
                data: {
                    updatedCount: 0,
                    continuation: undefined
                }
            });

            const result = await archive({
                archiveApiUrl: 'http://archive-api-endpoint',
                summarizeApiUrl: 'http://summarize-api-endpoint',
                sessionId,
                messages,
                wordCount,
                apiClient: mockApi,
                updateState: mockUpdateState
            });

            expect(result.length).toBe(51); // Original messages length + summary
            expect(result[0]).toEqual(summaryMessage);
            expect(mockUpdateState.calledWith(EApiEvent.kStartedArchiving)).toBe(true);
            expect(mockUpdateState.calledWith(EApiEvent.kFinishedArchiving)).toBe(true);
        });

        it('should handle archive API errors', async () => {
            const messages = createTestMessages(100);
            const summaryMessage: IChatMessage = {
                id: 'summary-1',
                className: ChatMessageClassName,
                role: EChatRole.kAssistant,
                content: 'Summary of archived messages',
                timestamp: new Date()
            };

            // Mock successful summarize
            mockApi.post.onFirstCall().resolves({
                data: {
                    summary: summaryMessage
                }
            });

            // Mock archive API error
            const error = new Error('Archive API Error');
            mockApi.post.onSecondCall().rejects(error);

            const result = await archive({
                archiveApiUrl: 'http://archive-api-endpoint',
                summarizeApiUrl: 'http://summarize-api-endpoint',
                sessionId,
                messages,
                wordCount,
                apiClient: mockApi,
                updateState: mockUpdateState
            });

            expect(result).toEqual(messages); // Should return original messages
            expect(mockUpdateState.calledWith(EApiEvent.kStartedArchiving)).toBe(true);
            expect(mockUpdateState.calledWith(EApiEvent.kError)).toBe(true);
        });
    });
}); 