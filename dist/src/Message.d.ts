/**
 * Message.tsx
 *
 * A reusable component that displays messages with different intents (info, warning, error).
 * Uses Fluent UI MessageBar to provide consistent message styling and layout.
 */
/*! Copyright Jon Verrier 2025 */
import React from 'react';
/**
 * MessageIntent enum
 *
 * Represents the different intents for messages.
 */
export declare enum MessageIntent {
    kInfo = "info",
    kWarning = "warning",
    kError = "error"
}
/**
 * IMessageProps interface
 *
 * Represents the properties for the Message component.
 */
export interface IMessageProps {
    intent: MessageIntent;
    title: string;
    body: string;
    dismissable: boolean;
    onDismiss?(): void;
}
/**
 * Message component
 *
 * Displays a message with a title, body, and optional dismiss button.
 */
export declare const Message: (props: IMessageProps) => false | React.JSX.Element;
//# sourceMappingURL=Message.d.ts.map