/**
 * MultilineEdit.test.tsx
 * 
 * Unit tests for the MultilineEdit component that provides a multiline text input field
 * with dynamic height adjustment and keyboard controls.
 */
// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders with correct caption and placeholder', () => {
    render(<MultilineEdit {...defaultProps} />);
    
    expect(screen.getByText('Test Caption')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter text here')).toBeTruthy();
  });

  it('calls onChange when text is entered', () => {
    let changedText = '';
    const onChange = (text: string) => {
      changedText = text;
    };

    render(<MultilineEdit {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByPlaceholderText('Enter text here');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    expect(changedText).toBe('New text');
  });

  it('calls onSend when Ctrl+Enter is pressed', () => {
    let sentText = '';
    const onSend = (text: string) => {
      sentText = text;
    };

    render(<MultilineEdit {...defaultProps} message="Test message" onSend={onSend} />);
    
    const textarea = screen.getByPlaceholderText('Enter text here');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    
    expect(sentText).toBe('Test message');
  });

  it('clears text when Escape is pressed', () => {
    let clearedText = '';
    const onChange = (text: string) => {
      clearedText = text;
    };

    render(<MultilineEdit {...defaultProps} message="Test message" onChange={onChange} />);
    
    const textarea = screen.getByPlaceholderText('Enter text here');
    fireEvent.keyDown(textarea, { key: 'Escape' });
    
    expect(clearedText).toBe('');
  });

  it('respects maxLength property', () => {
    let changedText = '';
    const onChange = (text: string) => {
      changedText = text;
    };

    render(<MultilineEdit {...defaultProps} maxLength={5} onChange={onChange} />);
    
    const textarea = screen.getByPlaceholderText('Enter text here') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '12345678910' } });
    
    // The component passes the full text to onChange, and the textarea's maxLength
    // attribute handles the visual limitation
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
    
    // The height should be greater than the default single-line height
    expect(parseInt(style.height)).toBeGreaterThan(20);
  });

  it('respects enabled property', () => {
    // First render with enabled=false
    const { unmount } = render(<MultilineEdit {...defaultProps} enabled={false} />);
    
    // Get the textarea and check it's disabled
    const disabledTextarea = screen.getByPlaceholderText('Enter text here') as HTMLTextAreaElement;
    expect(disabledTextarea.disabled).toBe(true);
    
    // Unmount the first render
    unmount();
    
    // Then render with enabled=true
    render(<MultilineEdit {...defaultProps} enabled={true} />);
    
    // Get the new textarea and check it's not disabled
    const enabledTextarea = screen.getByPlaceholderText('Enter text here') as HTMLTextAreaElement;
    expect(enabledTextarea.disabled).toBe(false);
  });
}); 