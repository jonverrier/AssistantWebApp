/**
 * ChatHistory.tsx
 * 
 * A reusable component that displays a history of chat messages between a user and an assistant.
 * Uses Fluent UI components to provide consistent styling and layout.
 */

/*! Copyright Jon Verrier 2025 */

// React
import React from 'react';

// Fluent
import { 
    Text,
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
import { IChatMessage, EChatRole } from '../import/AssistantChatApiTypes';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalM,
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
        backgroundColor: tokens.colorBrandBackground2,
    },
    assistantMessage: {
        backgroundColor: tokens.colorNeutralBackground2,
    },
    avatar: {
        flexShrink: 0,
    },
    timestamp: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        marginTop: tokens.spacingVerticalXS,
    }
});

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
                <div key={index} className={styles.messageContainer}>
                    <Avatar
                        className={styles.avatar}
                        icon={message.role === EChatRole.kUser ? <PersonRegular /> : <BotRegular />}
                        color={message.role === EChatRole.kUser ? "brand" : "neutral"}
                    />
                    <div className={mergeClasses(
                        styles.messageContent,
                        message.role === EChatRole.kUser ? styles.userMessage : styles.assistantMessage
                    )}>
                        <Text>{message.content}</Text>
                        <div className={styles.timestamp}>
                            {message.timestamp.toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}; 