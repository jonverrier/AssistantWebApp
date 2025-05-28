/**
 * Tests for the Cookie module that handles session UUID management.
 */
// Copyright (c) Jon Verrier, 2025

import { expect } from 'expect';
import { axiosPostStub } from './setup';
import { getSessionUuid } from '../src/SessionCall';

describe('getSessionUuid', function() {
    afterEach(() => {
        // Reset the stub's behavior between tests
        axiosPostStub.reset();
    });

    it('should get new session ID when no email or session ID provided', async () => {
        const testUuid = '123e4567-e89b-12d3-a456-426614174000';
        axiosPostStub.resolves({
            data: {
                sessionId: testUuid
            }
        });

        const result = await getSessionUuid('http://test-api/session');
        
        expect(result).toBe(testUuid);
        expect(axiosPostStub.calledOnce).toBe(true);
        expect(axiosPostStub.firstCall.args[0]).toBe('http://test-api/session');
        expect(axiosPostStub.firstCall.args[1]).toEqual({
            email: undefined,
            sessionId: undefined
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
        const testEmail = 'test@example.com';
        
        axiosPostStub.resolves({
            data: {
                sessionId: existingUuid
            }
        });

        const result = await getSessionUuid('http://test-api/session', testEmail, existingUuid);
        
        expect(result).toBe(existingUuid);
        expect(axiosPostStub.calledOnce).toBe(true);
        expect(axiosPostStub.firstCall.args[1]).toEqual({
            email: testEmail,
            sessionId: existingUuid
        });
    });

    it('should generate consistent session ID based on email when no session ID provided', async () => {
        const testEmail = 'test@example.com';
        const emailBasedUuid = '456e7890-e12d-12d3-a456-789012345678'; // Example consistent UUID based on email
        
        axiosPostStub.resolves({
            data: {
                sessionId: emailBasedUuid
            }
        });

        // First call
        const result1 = await getSessionUuid('http://test-api/session', testEmail);
        expect(result1).toBe(emailBasedUuid);
        
        // Second call should return same UUID
        const result2 = await getSessionUuid('http://test-api/session', testEmail);
        expect(result2).toBe(emailBasedUuid);
        
        expect(axiosPostStub.calledTwice).toBe(true);
        expect(axiosPostStub.firstCall.args[1]).toEqual({
            email: testEmail,
            sessionId: undefined
        });
        expect(axiosPostStub.secondCall.args[1]).toEqual({
            email: testEmail,
            sessionId: undefined
        });
    });

    it('should handle missing sessionId in response', async () => {
        axiosPostStub.resolves({
            data: {}
        });

        const result = await getSessionUuid('http://test-api/session');
        
        expect(result).toBeUndefined();
    });

    it('should handle API error', async () => {
        axiosPostStub.rejects(new Error('Network error'));

        const result = await getSessionUuid('http://test-api/session');
        
        expect(result).toBeUndefined();
    });
}); 