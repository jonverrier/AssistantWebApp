/**
 * Tests for LoggingUtilities
 */
// Copyright (c) Jon Verrier, 2025

import { expect } from 'expect';
import sinon from 'sinon';
import { ILoggingContext, Logger, getLogger, ConsoleLoggingContext } from '../src/LoggingUtilities';
import { ELoggerType } from '../src/LoggingTypes';
import * as ConfigStrings from '../src/ConfigStrings';

describe('LoggingUtilities', () => {
    let mockContext: ILoggingContext;
    let logSpy: sinon.SinonSpy;
    let infoSpy: sinon.SinonSpy;
    let warningSpy: sinon.SinonSpy;
    let errorSpy: sinon.SinonSpy;
    let getConfigStringsStub: sinon.SinonStub;
    let sandbox: sinon.SinonSandbox;

    const mockConfigStrings: ConfigStrings.IConfigStrings = {
        googleCaptchaSiteKey: 'test-key',
        googleClientId: 'test-client-id',
        loginAction: 'login',
        chatAction: 'chat',
        termsAction: 'terms',
        privacyAction: 'privacy',
        homeAction: 'home',
        aboutAction: 'about',
        contactAction: 'contact',
        screenUrl: 'http://test.com/screen',
        chatUrl: 'http://test.com/chat',
        messagesApiUrl: 'http://test.com/messages',
        archiveApiUrl: 'http://test.com/archive',
        summariseApiUrl: 'http://test.com/summarise',
        captchaApiUrl: 'http://test.com/captcha',
        sessionApiUrl: 'http://test.com/session',
        loggingTypes: [ELoggerType.kApi, ELoggerType.kInternal]
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create mock logging context
        mockContext = new ConsoleLoggingContext();

        // Create spies
        logSpy = sandbox.spy(mockContext, 'log');
        infoSpy = sandbox.spy(mockContext, 'info');
        warningSpy = sandbox.spy(mockContext, 'warning');
        errorSpy = sandbox.spy(mockContext, 'error');

        // Stub getConfigStrings to return both logger types enabled
        getConfigStringsStub = sandbox.stub(ConfigStrings, 'getConfigStrings').returns(mockConfigStrings);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('ConsoleLogging', () => {
        it('should create logger with correct type', () => {
            const logger = new Logger(mockContext, ELoggerType.kApi);
            expect(logger).toBeInstanceOf(Logger);
        });

        it('should sanitize and log input messages when enabled', () => {
            const logger = new Logger(mockContext, ELoggerType.kApi);
            const sensitiveMessage = 'User email@example.com with card 4111111111111111';
            
            logger.logInput(sensitiveMessage);
            
            expect(infoSpy.calledWith(
                sinon.match((value: string) => value.includes('[EMAIL]'))
            )).toBe(true);
            expect(infoSpy.calledWith(
                sinon.match((value: string) => value.includes('[CARD]'))
            )).toBe(true);
        });

        it('should sanitize and log response messages when enabled', () => {
            const logger = new Logger(mockContext, ELoggerType.kApi);
            const sensitiveMessage = 'Response sent to email@example.com';
            
            logger.logResponse(sensitiveMessage);
            
            expect(infoSpy.calledWith(
                sinon.match((value: string) => value.includes('[EMAIL]'))
            )).toBe(true);
        });

        it('should always log errors regardless of type configuration', () => {
            // Mock config to disable all logging
            getConfigStringsStub.returns({
                ...mockConfigStrings,
                loggingTypes: []
            });

            const logger = new Logger(mockContext, ELoggerType.kApi);
            const errorMessage = 'Critical error occurred';
            
            logger.logError(errorMessage);
            
            expect(errorSpy.calledWith(
                sinon.match((value: string) => value.includes(errorMessage))
            )).toBe(true);
        });

        it('should not log input/response when type is disabled', () => {
            // Mock config to disable API logging
            getConfigStringsStub.returns({
                ...mockConfigStrings,
                loggingTypes: [ELoggerType.kInternal]
            });

            const logger = new Logger(mockContext, ELoggerType.kApi);
            
            logger.logInput('test input');
            logger.logResponse('test response');
            
            expect(infoSpy.called).toBe(false);
        });

        it('should handle undefined messages', () => {
            const logger = new Logger(mockContext, ELoggerType.kApi);
            
            logger.logError(undefined as unknown as string);
            
            expect(errorSpy.calledWith(
                sinon.match((value: string) => value.includes('Unknown error'))
            )).toBe(true);
        });

        it('should remove HTML tags from messages', () => {
            const logger = new Logger(mockContext, ELoggerType.kApi);
            const message = '<script>alert("xss")</script> Hello <b>world</b>';
            
            logger.logInput(message);
            
            expect(infoSpy.calledWith(
                sinon.match((value: string) => value.includes('Hello world'))
            )).toBe(true);
        });
    });

    describe('getLogger', () => {
        it('should return a configured logger instance', () => {
            const logger = getLogger(mockContext, ELoggerType.kApi);
            
            expect(logger).toBeInstanceOf(Logger);
            expect(logger.logInput).toBeDefined();
            expect(logger.logResponse).toBeDefined();
            expect(logger.logError).toBeDefined();
        });

        it('should return different instances for different types', () => {
            const apiLogger = getLogger(mockContext, ELoggerType.kApi);
            const internalLogger = getLogger(mockContext, ELoggerType.kInternal);
            
            expect(apiLogger).not.toBe(internalLogger);
        });
    });

    describe('ConsoleLoggingContext', () => {
        let consoleLogSpy: sinon.SinonSpy;
        let consoleInfoSpy: sinon.SinonSpy;
        let consoleWarnSpy: sinon.SinonSpy;
        let consoleErrorSpy: sinon.SinonSpy;
        let context: ConsoleLoggingContext;

        beforeEach(() => {
            consoleLogSpy = sandbox.spy(console, 'log');
            consoleInfoSpy = sandbox.spy(console, 'info');
            consoleWarnSpy = sandbox.spy(console, 'warn');
            consoleErrorSpy = sandbox.spy(console, 'error');
            context = new ConsoleLoggingContext();
        });

        it('should log messages to console', () => {
            const message = 'Test message';
            const details = { test: 'details' };

            context.log(message, details);
            context.info(message, details);
            context.warning(message, details);
            context.error(message, details);

            expect(consoleLogSpy.calledWith(message, details)).toBe(true);
            expect(consoleInfoSpy.calledWith(message, details)).toBe(true);
            expect(consoleWarnSpy.calledWith(message, details)).toBe(true);
            expect(consoleErrorSpy.calledWith(message, details)).toBe(true);
        });

        it('should handle undefined details', () => {
            const message = 'Test message';

            context.log(message);
            context.info(message);
            context.warning(message);
            context.error(message);

            expect(consoleLogSpy.calledWith(message, '')).toBe(true);
            expect(consoleInfoSpy.calledWith(message, '')).toBe(true);
            expect(consoleWarnSpy.calledWith(message, '')).toBe(true);
            expect(consoleErrorSpy.calledWith(message, '')).toBe(true);
        });
    });
}); 