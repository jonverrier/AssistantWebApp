/**
 * Message.test.tsx
 * 
 * Unit tests for the Message component that displays notifications with different intents.
 */
// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import expect from 'expect';
import { Message, MessageIntent } from '../src/Message';

describe('Message Component', () => {
  const defaultProps = {
    intent: MessageIntent.kInfo,
    title: 'Test Title',
    body: 'Test Body',
    dismissable: true,
  };

  it('renders with correct title and body', () => {
    render(<Message {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText('Test Body')).toBeTruthy();
  });

  it('renders with different intents - info', () => {
    render(<Message {...defaultProps} intent={MessageIntent.kInfo} />);
    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText('Test Body')).toBeTruthy();
  });
  
  it('renders with different intents - warning', () => {
    render(<Message {...defaultProps} intent={MessageIntent.kWarning} />);
    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText('Test Body')).toBeTruthy();
  });

  it('renders with different intents - error', () => {
    render(<Message {...defaultProps} intent={MessageIntent.kError} />);
    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText('Test Body')).toBeTruthy();
  });

  it('shows dismiss button when dismissable is true', () => {
    render(<Message {...defaultProps} dismissable={true} />);
    expect(screen.getByLabelText('dismiss')).toBeTruthy();
  });

  it('does not show dismiss button when dismissable is false', () => {
    render(<Message {...defaultProps} dismissable={false} />);
    expect(screen.queryByLabelText('dismiss')).toBeNull();
  });

  it('dismisses message when dismiss button is clicked', () => {
    render(<Message {...defaultProps} />);
    
    const dismissButton = screen.getByLabelText('dismiss');
    fireEvent.click(dismissButton);
    
    expect(screen.queryByText('Test Title')).toBeNull();
    expect(screen.queryByText('Test Body')).toBeNull();
  });
}); 