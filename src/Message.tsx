/**
 * Message.tsx
 * 
 * A reusable component that displays messages with different intents (info, warning, error).
 * Uses Fluent UI MessageBar to provide consistent message styling and layout.
 */

/*! Copyright Jon Verrier 2025 */

// React
import React, { useState } from 'react';

// Fluent
import { MessageBar,
   MessageBarActions,
   MessageBarTitle,
   MessageBarBody, Button, MessageBarGroup } from '@fluentui/react-components';
import { DismissRegular } from "@fluentui/react-icons";

import { standardColumnElementStyles } from './CommonStyles';

/**
 * MessageIntent enum
 * 
 * Represents the different intents for messages.
 */
export enum MessageIntent {
   kInfo = "info",
   kWarning = "warning",
   kError = "error",
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
   onDismiss? () : void;   
}

/**
 * Message component
 * 
 * Displays a message with a title, body, and optional dismiss button.
 */   
export const Message = (props: IMessageProps) => {

   const messageClasses = standardColumnElementStyles();
   const [isDismissed, setIsDismissed] = useState(false);

   const onDismiss = () => {
      setIsDismissed(true);
      props.onDismiss?.();
   }

   return (
      !isDismissed && (
         <MessageBarGroup className={messageClasses.root}>
            <MessageBar intent={props.intent}>
               <MessageBarBody>
                  <MessageBarTitle>{props.title}</MessageBarTitle>
                  {props.body}
               </MessageBarBody>
               {props.dismissable && (
                  <MessageBarActions
                     containerAction={
                        <Button
                           aria-label="dismiss"
                           appearance="transparent"
                           icon={<DismissRegular />}
                           onClick={onDismiss}
                        />
                     }
                  >
                  </MessageBarActions>
               )}
            </MessageBar>
         </MessageBarGroup>)
   );
}
    
