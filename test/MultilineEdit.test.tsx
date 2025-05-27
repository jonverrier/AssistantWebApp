/**
 * MultilineEdit.test.tsx
 * 
 * Unit tests for the MultilineEdit component that provides a multiline text input field
 * with dynamic height adjustment and keyboard controls.
 */
// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import expect from 'expect';
import { MultilineEdit } from '../src/MultilineEdit';
import { EMultilineEditUIStrings } from '../src/MultilineEditUIStrings';

describe('MultilineEdit Component', () => {
  const defaultProps = {
    caption: 'Test Caption',
    placeholder: 'Enter text here',
    maxLength: 100,
    message: '',
    fontNameForTextWrapCalculation: '12px Arial',
    onSend: () => {},
    onChange: () => {},
    enabled: true,
    defaultHeightLines: 1
  };

  beforeEach(() => {
    // Save original clipboard
    const originalClipboard = Object.getOwnPropertyDescriptor(window, 'clipboard');
    
    // Delete existing clipboard property if it exists
    if (originalClipboard) {
      delete (window as any).clipboard;
    }

    // Create a mock clipboard
    Object.defineProperty(window, 'clipboard', {
      value: {
        writeText: () => Promise.resolve(),
        readText: () => Promise.resolve(''),
      },
      writable: true,
      configurable: true
    });

    return () => {
      // Restore original clipboard if it existed
      if (originalClipboard) {
        Object.defineProperty(window, 'clipboard', originalClipboard);
      } else {
        delete (window as any).clipboard;
      }
    };
  });

  it('renders with correct caption and placeholder', () => {
    render(<MultilineEdit {...defaultProps} />);
    
    expect(screen.getByText('Test Caption')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter text here')).toBeTruthy();
  });

  it('calls onChange when text is entered', async () => {
    let changedText = '';
    const onChange = (text: string) => {
      changedText = text;
    };

    render(<MultilineEdit {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByPlaceholderText('Enter text here');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    expect(changedText).toBe('New text');
  });

  it('calls onSend when Ctrl+Enter is pressed', async () => {
    let sentText = '';
    const onSend = (text: string) => {
      sentText = text;
    };

    render(<MultilineEdit {...defaultProps} message="Test message" onSend={onSend} />);
    
    const textarea = screen.getByPlaceholderText('Enter text here');
    fireEvent.keyDown(textarea, { 
      key: 'Enter',
      code: 'Enter',
      ctrlKey: true,
      bubbles: true 
    });
    
    expect(sentText).toBe('Test message');
  });

  it('clears text when Escape is pressed', async () => {
    let clearedText = '';
    const onChange = (text: string) => {
      clearedText = text;
    };

    render(<MultilineEdit {...defaultProps} message="Test message" onChange={onChange} />);
    
    const textarea = screen.getByPlaceholderText('Enter text here');
    fireEvent.keyDown(textarea, { 
      key: 'Escape',
      code: 'Escape',
      bubbles: true 
    });
    
    expect(clearedText).toBe('');
  });

  it('respects maxLength property', async () => {
    let changedText = '';
    const onChange = (text: string) => {
      changedText = text;
    };

    render(<MultilineEdit {...defaultProps} maxLength={5} onChange={onChange} />);
    
    const textarea = screen.getByPlaceholderText('Enter text here') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '12345678910' } });
    
    expect(changedText).toBe('12345');
    expect(textarea.maxLength).toBe(5);
  });

  it('displays message prompt hint', () => {
    render(<MultilineEdit {...defaultProps} />);
    
    expect(screen.getByText(EMultilineEditUIStrings.kMessageTextPrompt)).toBeTruthy();
  });

  it('adjusts height based on content', () => {
    render(<MultilineEdit {...defaultProps} message="Line 1\nLine 2\nLine 3" />);
    
    const textarea = screen.getByPlaceholderText('Enter text here');
    const style = window.getComputedStyle(textarea);
    
    expect(parseInt(style.height)).toBeGreaterThan(20);
  });

  it('respects enabled property', () => {
    const { unmount } = render(<MultilineEdit {...defaultProps} enabled={false} />);
    
    const disabledTextarea = screen.getByPlaceholderText('Enter text here') as HTMLTextAreaElement;
    expect(disabledTextarea.disabled).toBe(true);
    
    unmount();
    
    render(<MultilineEdit {...defaultProps} enabled={true} />);
    
    const enabledTextarea = screen.getByPlaceholderText('Enter text here') as HTMLTextAreaElement;
    expect(enabledTextarea.disabled).toBe(false);
  });
}); 