/**
 * CopyableText.tsx
 * 
 * A reusable component that displays text with a copy-to-clipboard button.
 * Provides a clean interface for displaying and copying text content.
 */

/*! Copyright Jon Verrier 2025 */
 
// React
import React from 'react';

// Fluent
import { Text, makeStyles, Toolbar, ToolbarButton, shorthands } from '@fluentui/react-components';
import { CopyRegular } from '@fluentui/react-icons';

import { standardTextStyles} from './CommonStyles';

export interface ICopyableTextProps {
   placeholder: string;
   text: string;
   id: string;
}

export const copyableTextStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',    // start layout at the top       
      alignItems: 'left',
      width: "100%",
      //...shorthands.borderColor("gray"),
      //...shorthands.borderWidth("1px"),
      //...shorthands.borderStyle("solid"),
      //borderRadius: "4px",
      padding: "4px"
   },
});

export const copyableTextButtonRowStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',    // start layout at the right       
      alignItems: 'right',
      width: "100%"
   },
});

export const CopyableText = (props: ICopyableTextProps) => {

   const textClasses = standardTextStyles();
   const copyableTextClasses = copyableTextStyles();
   const copyableTextButtonRowClasses = copyableTextButtonRowStyles();

   const copyToClipboard = () => {
      navigator.clipboard.writeText(props.text)
         .then(() => {
            // Optional: Add visual feedback that text was copied
         })
         .catch(err => {
         });
   };

   return (<div className={textClasses.root}>
      {
         props.text.length > 0 ?
            <div className={copyableTextClasses.root}>
               <div className={copyableTextButtonRowClasses.root}>
                  <Toolbar aria-label="Default" {...props}>
                     <ToolbarButton
                        aria-label="Copy"
                        appearance="subtle"
                        icon={<CopyRegular />}
                        onClick={copyToClipboard}
                     />
                  </Toolbar>
               </div>
               {props.text.split('\n').map((line, index) => {
                  const myId = props.id + '-' + index;
                  return <Text key={index} className={textClasses.normal} id={myId} data-testid={myId}>{line}</Text>;
               })}
            </div>
            : <Text className={textClasses.normalGrey} id={props.id} data-testid={props.id}>{props.placeholder}</Text>
      }
   </div>);
}
