/**
 * Plain.test.tsx
 * 
 * Unit tests for the Plain component using Mocha and expect.
 * Tests rendering of title, content, and various text formatting scenarios.
 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render } from '@testing-library/react';
import { PlainText } from '../src/PlainText';
import { expect } from 'expect';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../src/UserContext';
import { MockStorage } from './MockStorage';

describe('Plain Component', () => {
    let mockStorage: MockStorage;

    beforeEach(() => {
        mockStorage = new MockStorage();
    });

    afterEach(() => {
        mockStorage.clear();
    });

    it('renders title correctly', () => {
        const { getByText } = render(
         <UserProvider storage={mockStorage}>
            <BrowserRouter>         
                <PlainText 
                    title="Test Title" 
                    content="Test content" 
                />
            </BrowserRouter>
         </UserProvider>
        );
        expect(getByText('Test Title')).toBeTruthy();
    });

    it('renders normal text content correctly', () => {
        const { getByText } = render(
         <UserProvider storage={mockStorage}>
            <BrowserRouter>            
                <PlainText 
                    title="Test" 
                    content="This is a test line" 
                />
            </BrowserRouter>
         </UserProvider>
        );
        expect(getByText('This is a test line')).toBeTruthy();
    });

    it('renders numbered headings correctly', () => {
        const { getByText } = render(
         <UserProvider storage={mockStorage}>
            <BrowserRouter>
                <PlainText 
                    title="Test" 
                    content="1. First heading
                    2. Second heading" 
                />
            </BrowserRouter>
         </UserProvider>
        );
        expect(getByText('1. First heading')).toBeTruthy();
        expect(getByText('2. Second heading')).toBeTruthy();
    });

    it('renders URLs as links', () => {
        const { getByText } = render(
         <UserProvider storage={mockStorage}>
            <BrowserRouter>
                <PlainText 
                    title="Test" 
                    content="Visit https://example.com for more info" 
                />
            </BrowserRouter>
         </UserProvider>
        );
        const link = getByText('https://example.com');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toBe('https://example.com');
    });

    it('handles mixed content correctly', () => {
        const content = `1. First point
Normal text line
Visit https://example.com
2. Second point
Another normal line`;
        
        const { getByText } = render(
         <UserProvider storage={mockStorage}>
            <BrowserRouter>
                <PlainText 
                    title="Test" 
                    content={content} 
                />
            </BrowserRouter>
         </UserProvider>
        );
        
        expect(getByText('1. First point')).toBeTruthy();
        expect(getByText('Normal text line')).toBeTruthy();
        expect(getByText('https://example.com')).toBeTruthy();
        expect(getByText('2. Second point')).toBeTruthy();
        expect(getByText('Another normal line')).toBeTruthy();
    });

    it('renders empty content gracefully', () => {
        const { container } = render(
         <UserProvider storage={mockStorage}>
            <BrowserRouter>
                <PlainText 
                    title="Test" 
                    content="" 
                />
            </BrowserRouter>
         </UserProvider>
        );
        expect(container).toBeTruthy();
    });
}); 