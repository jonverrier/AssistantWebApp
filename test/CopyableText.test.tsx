/**
 * CopyableText.test.tsx
 * 
 * Unit tests for the CopyableText component that displays text with a copy-to-clipboard button.
 */
// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import expect from 'expect';
import { CopyableText } from '../src/CopyableText';

describe('CopyableText Component', () => {
  const defaultProps = {
    placeholder: 'No text to display',
    text: 'Sample text to copy',
    id: '1',
  };

  it('renders with correct text when text is provided', () => {
    render(<CopyableText {...defaultProps} />);
    
    expect(screen.getByText('Sample text to copy')).toBeTruthy();
    expect(screen.getByLabelText('Copy')).toBeTruthy();
  });

  it('renders placeholder when text is empty', () => {
    render(<CopyableText placeholder="No text to display" text="" id="1" />);
    
    expect(screen.getByText('No text to display')).toBeTruthy();
    expect(screen.queryByLabelText('Copy')).toBeNull();
  });

  it('calls clipboard API when copy button is clicked', () => {
    // Mock the clipboard API
    const mockClipboard = {
      writeText: (text: string) => Promise.resolve(),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    let clipboardCalled = false;
    const originalWriteText = mockClipboard.writeText;
    mockClipboard.writeText = (text: string) => {
      clipboardCalled = true;
      expect(text).toBe('Sample text to copy');
      return originalWriteText(text);
    };

    render(<CopyableText {...defaultProps} />);
    
    const copyButton = screen.getByLabelText('Copy');
    fireEvent.click(copyButton);
    
    expect(clipboardCalled).toBeTruthy();
  });

  it('handles clipboard error gracefully', () => {
    // Mock the clipboard API to throw an error
    const mockClipboard = {
      writeText: (text: string) => Promise.reject(new Error('Clipboard error')),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    render(<CopyableText {...defaultProps} />);
    
    const copyButton = screen.getByLabelText('Copy');
    fireEvent.click(copyButton);
    
    // The component should not crash and should still be visible
    expect(screen.getByText('Sample text to copy')).toBeTruthy();
  });
}); 