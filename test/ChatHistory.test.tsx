/**
 * ChatHistory.test.tsx
 * 
 * Unit tests for the ChatHistory component that displays chat messages between user and assistant.
 */
// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { render, screen } from '@testing-library/react';
import expect from 'expect';

import { EChatRole } from 'prompt-repository';

import { ChatHistory } from '../src/ChatHistory';


describe('ChatHistory Component', () => {
  const mockMessages = [
    {
      role: EChatRole.kUser,
      content: 'Hello, assistant!',
      timestamp: new Date('2024-03-20T10:00:00')
    },
    {
      role: EChatRole.kAssistant,
      content: 'Hi there! How can I help you?',
      timestamp: new Date('2024-03-20T10:00:05')
    }
  ];

  it('renders all messages in the correct order', () => {
    render(<ChatHistory messages={mockMessages} />);
    
    const messages = screen.getAllByText(/Hello|Hi there/);
    expect(messages).toHaveLength(2);
    expect(messages[0].textContent).toBe('Hello, assistant!');
    expect(messages[1].textContent).toBe('Hi there! How can I help you?');
  });

  it('displays correct timestamps for messages', () => {
    render(<ChatHistory messages={mockMessages} />);
    
    const timestamps = screen.getAllByText(/10:00/);
    expect(timestamps).toHaveLength(2);
  });

  it('renders user avatar for user messages', () => {
    render(<ChatHistory messages={[mockMessages[0]]} />);
    
    // Check for user avatar (PersonRegular icon)
    const userAvatar = screen.getByRole('img');
    expect(userAvatar).toBeTruthy();
  });

  it('renders assistant avatar for assistant messages', () => {
    render(<ChatHistory messages={[mockMessages[1]]} />);
    
    // Check for assistant avatar (BotRegular icon)
    const assistantAvatar = screen.getByRole('img');
    expect(assistantAvatar).toBeTruthy();
  });

  it('renders empty state when no messages are provided', () => {
    render(<ChatHistory messages={[]} />);
    
    // The component should render without errors but show no messages
    expect(screen.queryByText(/Hello|Hi there/)).toBeNull();
  });
}); 