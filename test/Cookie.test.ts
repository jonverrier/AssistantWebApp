/**
 * Tests for the Cookie module that handles session UUID management.
 */
// Copyright (c) Jon Verrier, 2025

import { expect } from 'expect';
import sinon from 'sinon';
import { sandbox } from './setup';
import axios from 'axios';
import { getSessionUuid } from '../src/Cookie';

describe('getSessionUuid', function() {
    let mockAxios: sinon.SinonStub;

    before(() => {
        // Create the stub once before all tests
        mockAxios = sandbox.stub(axios, 'get');
    });

    afterEach(() => {
        // Reset the stub's behavior between tests
        mockAxios.reset();
    });

    after(() => {
        // Restore original after all tests
        sandbox.restore();
    });

    it('should extract UUID from Set-Cookie header', async () => {
        const testUuid = '123e4567-e89b-12d3-a456-426614174000';
        mockAxios.resolves({
            headers: {
                'set-cookie': [`sessionId=${testUuid}; Path=/; HttpOnly; Secure; SameSite=Strict`]
            }
        });

        const result = await getSessionUuid('http://test-api/cookie');
        
        expect(result).toBe(testUuid);
        expect(mockAxios.calledOnce).toBe(true);
        expect(mockAxios.firstCall.args[0]).toBe('http://test-api/cookie');
        expect(mockAxios.firstCall.args[1]).toEqual({
            withCredentials: true,
            headers: {
                'Accept': 'application/json'
            }
        });
    });

    it('should handle missing Set-Cookie header', async () => {
        mockAxios.resolves({
            headers: {}
        });

        const result = await getSessionUuid('http://test-api/cookie');
        
        expect(result).toBeUndefined();
    });

    it('should handle empty Set-Cookie array', async () => {
        mockAxios.resolves({
            headers: {
                'set-cookie': []
            }
        });

        const result = await getSessionUuid('http://test-api/cookie');
        
        expect(result).toBeUndefined();
    });

    it('should handle cookie without sessionId', async () => {
        mockAxios.resolves({
            headers: {
                'set-cookie': ['otherCookie=value; Path=/']
            }
        });

        const result = await getSessionUuid('http://test-api/cookie');
        
        expect(result).toBeUndefined();
    });

    it('should handle API error', async () => {
        mockAxios.rejects(new Error('Network error'));

        const result = await getSessionUuid('http://test-api/cookie');
        
        expect(result).toBeUndefined();
    });
}); 