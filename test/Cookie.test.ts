/**
 * Tests for the Cookie module that handles session UUID management.
 */
// Copyright (c) Jon Verrier, 2025

import { expect } from 'expect';
import { axiosPostStub } from './setup';
import { getSessionUuid, IStorage } from '../src/Cookie';

describe('getSessionUuid', function() {
    let mockStorage: IStorage;
    let storageValues: Map<string, string>;

    before(() => {
        // Setup mock storage
        storageValues = new Map<string, string>();
        mockStorage = {
            get: (key: string) => storageValues.get(key) || undefined,
            set: (key: string, value: string) => storageValues.set(key, value)
        };
    });

    afterEach(() => {
        // Reset the stub's behavior between tests
        axiosPostStub.reset();
        storageValues.clear();
    });

    it('should get new session ID when no existing session', async () => {
        const testUuid = '123e4567-e89b-12d3-a456-426614174000';
        axiosPostStub.resolves({
            data: {
                sessionId: testUuid
            }
        });

        const result = await getSessionUuid('http://test-api/cookie', mockStorage);
        
        expect(result).toBe(testUuid);
        expect(axiosPostStub.calledOnce).toBe(true);
        expect(axiosPostStub.firstCall.args[0]).toBe('http://test-api/cookie');
        expect(axiosPostStub.firstCall.args[1]).toEqual({
            sessionId: undefined
        });
        expect(axiosPostStub.firstCall.args[2]).toEqual({
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        expect(storageValues.get('motif_session_id')).toBe(testUuid);
    });

    it('should send existing session ID when available', async () => {
        const existingUuid = 'existing-uuid-123';
        const newUuid = 'new-uuid-456';
        storageValues.set('motif_session_id', existingUuid);
        
        axiosPostStub.resolves({
            data: {
                sessionId: newUuid
            }
        });

        const result = await getSessionUuid('http://test-api/cookie', mockStorage);
        
        expect(result).toBe(newUuid);
        expect(axiosPostStub.calledOnce).toBe(true);
        expect(axiosPostStub.firstCall.args[1]).toEqual({
            sessionId: existingUuid
        });
        expect(storageValues.get('motif_session_id')).toBe(newUuid);
    });

    it('should handle missing sessionId in response', async () => {
        axiosPostStub.resolves({
            data: {}
        });

        const result = await getSessionUuid('http://test-api/cookie', mockStorage);
        
        expect(result).toBeUndefined();
        expect(storageValues.size).toBe(0);
    });

    it('should handle API error', async () => {
        axiosPostStub.rejects(new Error('Network error'));

        const result = await getSessionUuid('http://test-api/cookie', mockStorage);
        
        expect(result).toBeUndefined();
        expect(storageValues.size).toBe(0);
    });
}); 