/**
 * ChatHistory.tsx
 * 
 * A reusable component that displays a history of chat messages between a user and an assistant.
 * Uses Fluent UI components to provide consistent styling and layout.
 * 
 * Features:
 * - Displays messages in chronological order with user/assistant avatars
 * - Supports copyable text for assistant responses
 * - Responsive layout with Fluent UI styling
 * - Clear visual distinction between user and assistant messages
 */

/*! Copyright Jon Verrier 2025 */

// React
import React from 'react';

// Fluent
import { 
    makeStyles,
    tokens,
    Avatar,
    mergeClasses
} from '@fluentui/react-components';
import { 
    PersonRegular,
    BotRegular 
} from "@fluentui/react-icons";

// Types
import { IChatMessage, EChatRole } from 'prompt-repository';
import { CopyableText } from './CopyableText';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
        paddingTop: tokens.spacingVerticalM,
        paddingBottom: tokens.spacingVerticalM,
    },
    messageContainer: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        alignItems: 'flex-start',
    },
    messageContent: {
        flex: 1,
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground2,
    },
    userMessage: {
        //backgroundColor: `${tokens.colorBrandBackground2}CC`, // 80% opacity when trying whiteboard theme
        backgroundColor: tokens.colorBrandBackground2
    },
    assistantMessage: {
        //backgroundColor: `${tokens.colorNeutralBackground2}CC`, // 80% opacity
        backgroundColor: tokens.colorNeutralBackground2
    },
    avatar: {
        flexShrink: 0,
    },
    timestamp: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3
    }
});

/**
 * IChatMessageProps interface
 * 
 * Represents the properties for the ChatMessage component.
 */
export interface IChatMessageProps {
    message: IChatMessage;
}

/**
 * Formats a timestamp into a human-readable string
 * Returns 'Today', 'Yesterday', or 'Dayname DD Month' with time
 */
const formatTimestamp = (timestamp: Date): string => {
    const date = timestamp;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
        return `Today at ${time}`;
    } else if (isYesterday) {
        return `Yesterday at ${time}`;
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        }) + ` at ${time}`;
    }
};

/**
 * ChatMessage component
 * 
 * Displays a single chat message with user/assistant avatar and timestamp.
 */
export const ChatMessage: React.FC<IChatMessageProps> = ({ message }) => {
    const styles = useStyles();

    return (
        <div className={styles.messageContainer}>
            <Avatar
                className={styles.avatar}
                icon={message.role === EChatRole.kUser ? <PersonRegular /> : <BotRegular />}
                color={message.role === EChatRole.kUser ? "brand" : "neutral"}
            />
            <div 
                className={mergeClasses(
                    styles.messageContent,
                    message.role === EChatRole.kUser ? styles.userMessage : styles.assistantMessage
                )}
                data-testid="message-content"
            >
                <CopyableText 
                    text={message.content} 
                    placeholder=""
                    id={`message-${new Date(message.timestamp).getTime()}`}
                />
                <div className={styles.timestamp}>
                    {formatTimestamp(new Date(message.timestamp))}
                </div>
            </div>
        </div>
    );
};

/**
 * IChatHistoryProps interface
 * 
 * Represents the properties for the ChatHistory component.
 */
export interface IChatHistoryProps {
    messages: IChatMessage[];
}

/**
 * ChatHistory component
 * 
 * Displays a vertical list of chat messages with user and assistant avatars.
 */
export const ChatHistory: React.FC<IChatHistoryProps> = ({ messages }) => {
    const styles = useStyles();

    return (
        <div className={styles.root}>
            {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}
        </div>
    );
}; 