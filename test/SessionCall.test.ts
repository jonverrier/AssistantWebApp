/**
 * Tests for the Cookie module that handles session UUID management.
 */
// Copyright (c) Jon Verrier, 2025

import { expect } from 'expect';
import { axiosPostStub } from './setup';
import { getSessionData } from '../src/SessionCall';
import { EUserRole, ELoginProvider, EAssistantPersonality } from '../import/AssistantChatApiTypes';

describe('getSessionData', function() {
    afterEach(() => {
        // Reset the stub's behavior between tests
        axiosPostStub.reset();
    });

    it('should get new session ID when no email or session ID provided', async () => {
        const testUuid = '123e4567-e89b-12d3-a456-426614174000';
        axiosPostStub.resolves({
            data: {
                sessionId: testUuid,
                role: EUserRole.kGuest
            }
        });

        const userDetails = {
            email: 'test@example.com',
            userID: 'test-user-id',
            name: 'Test User',
            loginProvider: ELoginProvider.kGoogle
        };

        const result = await getSessionData('http://test-api/session', userDetails, EAssistantPersonality.kDemoAssistant);
        
        expect(result?.sessionId).toBe(testUuid);
        expect(result?.role).toBe(EUserRole.kGuest);
        expect(axiosPostStub.calledOnce).toBe(true);
        expect(axiosPostStub.firstCall.args[0]).toBe('http://test-api/session');
        expect(axiosPostStub.firstCall.args[1]).toEqual({
            userDetails,
            personality: EAssistantPersonality.kDemoAssistant
        });
        expect(axiosPostStub.firstCall.args[2]).toEqual({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    });

    it('should echo back the provided session ID', async () => {
        const existingUuid = 'existing-uuid-123';
        const userDetails = {
            email: 'test@example.com',
            userID: 'test-user-id',
            name: 'Test User',
            loginProvider: ELoginProvider.kGoogle
        };
        
        axiosPostStub.resolves({
            data: {
                sessionId: existingUuid,
                role: EUserRole.kMember
            }
        });

        const result = await getSessionData('http://test-api/session', userDetails, EAssistantPersonality.kDemoAssistant);
        
        expect(result?.sessionId).toBe(existingUuid);
        expect(result?.role).toBe(EUserRole.kMember);
        expect(axiosPostStub.calledOnce).toBe(true);
        expect(axiosPostStub.firstCall.args[1]).toEqual({
            userDetails,
            personality: EAssistantPersonality.kDemoAssistant
        });
    });

    it('should generate consistent session ID based on email when no session ID provided', async () => {
        const userDetails = {
            email: 'test@example.com',
            userID: 'test-user-id',
            name: 'Test User',
            loginProvider: ELoginProvider.kGoogle
        };
        const emailBasedUuid = '456e7890-e12d-12d3-a456-789012345678'; // Example consistent UUID based on email
        
        axiosPostStub.resolves({
            data: {
                sessionId: emailBasedUuid,
                role: EUserRole.kGuest
            }
        });

        // First call
        const result1 = await getSessionData('http://test-api/session', userDetails, EAssistantPersonality.kDemoAssistant);
        expect(result1?.sessionId).toBe(emailBasedUuid);
        expect(result1?.role).toBe(EUserRole.kGuest);
        
        // Second call should return same UUID
        const result2 = await getSessionData('http://test-api/session', userDetails, EAssistantPersonality.kDemoAssistant);
        expect(result2?.sessionId).toBe(emailBasedUuid);
        expect(result2?.role).toBe(EUserRole.kGuest);
        
        expect(axiosPostStub.calledTwice).toBe(true);
        expect(axiosPostStub.firstCall.args[1]).toEqual({
            userDetails,
            personality: EAssistantPersonality.kDemoAssistant
        });
        expect(axiosPostStub.secondCall.args[1]).toEqual({
            userDetails,
            personality: EAssistantPersonality.kDemoAssistant
        });
    });

    it('should handle missing sessionId in response', async () => {
        const userDetails = {
            email: 'test@example.com',
            userID: 'test-user-id',
            name: 'Test User',
            loginProvider: ELoginProvider.kGoogle
        };

        axiosPostStub.resolves({
            data: {}
        });

        const result = await getSessionData('http://test-api/session', userDetails, EAssistantPersonality.kDemoAssistant);
        
        expect(result).toBeUndefined();
    });

    it('should handle API error', async () => {
        const userDetails = {
            email: 'test@example.com',
            userID: 'test-user-id',
            name: 'Test User',
            loginProvider: ELoginProvider.kGoogle
        };

        axiosPostStub.rejects(new Error('Network error'));

        const result = await getSessionData('http://test-api/session', userDetails, EAssistantPersonality.kDemoAssistant);
        
        expect(result).toBeUndefined();
    });
}); 