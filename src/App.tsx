/**
 * App.tsx
 * 
 * Main part. Sets up the Fluent UI provider and
 * renders the core application components. Handles the main layout and
 * styling of the application interface.
 */
/*! Copyright Jon Verrier 2025 */

// React
import React, { useState } from 'react';

// Fluent
import {
   Text,
   Link as FluentLink, Spinner 
} from '@fluentui/react-components';

// external packages
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';

// local packages
import { IMultilineEditProps, MultilineEdit } from './MultilineEdit';
import { EAppMode, getUIStrings } from './UIStrings';
import { standardTextStyles, standardLinkStyles, standardColumnElementStyles} from './CommonStyles';
import { CopyableText } from './CopyableText';
import { Message, MessageIntent } from './Message';
import { LinterUIStateMachine, EUIState, EApiEvent } from './UIStateMachine';
import { processChat } from './Call';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { Spacer, Footer } from './SiteUtilities';

const kFontNameForTextWrapCalculation = "12pt Segoe UI";
const kRequirementMaxLength = 4096;

export interface IAppProps {
   appMode: EAppMode;
}

// Loca version that works in browser
//https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

const sessionUuid = uuidv4();

const local = true;

export const App = (props: IAppProps) => {
   
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const columnElementClasses = standardColumnElementStyles();
   const textClasses = standardTextStyles();   
   const linkClasses = standardLinkStyles();

   const uiStrings = getUIStrings(props.appMode);

   let [state, setState] = useState<LinterUIStateMachine>(new LinterUIStateMachine(EUIState.kWaiting));

   const [message, setMessage] = useState("");
   const [streamedResponse, setStreamedResponse] = useState<string|undefined>(undefined);

   async function callServer() : Promise<void> {
      const screenUrl = local ? 'http://localhost:7071/api/ScreenInput' : 'https://motifassistantapi.azurewebsites.net/api/ScreenInput';
      const chatUrl = local ? 'http://localhost:7071/api/StreamChat' : 'https://motifassistantapi.azurewebsites.net/api/StreamChat';

      if (!message) return;

      // Reset streamed response
      setStreamedResponse("");

      const result = await processChat({
         screeningApiUrl: screenUrl,
         chatApiUrl: chatUrl,
         input: message,
         updateState: (event: EApiEvent) => {
            state.transition(event);
            setState(new LinterUIStateMachine(state.getState()));
         },
         sessionId: sessionUuid,
         personality: EAssistantPersonality.kMastersAdviser,
         onChunk: (chunk: string) => {
            setStreamedResponse(prev => prev + chunk);
         }
      });
   };
   
   const onDismiss = () => {
      setStreamedResponse(undefined);
      state.transition(EApiEvent.kReset);
      setState(new LinterUIStateMachine(state.getState()));      
   };

   const onSend = (message_: string) => {
      setMessage(message_);
      callServer();
   };

   const onChange = (message_: string) => {
      setMessage(message_);
      state.transition(EApiEvent.kReset);
      setState(new LinterUIStateMachine(state.getState()));      
   };

   const multilineEditProps: IMultilineEditProps = {
      caption: uiStrings.kChatPreamble,
      placeholder: uiStrings.kChatPlaceholder,
      maxLength: kRequirementMaxLength,
      message: message,
      enabled: state.getState() === EUIState.kWaiting,
      fontNameForTextWrapCalculation: kFontNameForTextWrapCalculation,
      defaultHeightLines: 10,
      onSend: onSend,
      onChange: onChange,
   };
      

   let blank = <div></div>;
   let offTopic = blank;
   let error = blank;
   let success = blank;
   
   if (state.getState() === EUIState.kOffTopic) {
      offTopic = (
         <div className={columnElementClasses.root}>
            &nbsp;&nbsp;&nbsp;                  
            <Message 
               intent={MessageIntent.kWarning}
               title={uiStrings.kWarning}
               body={uiStrings.kLooksOffTopic}
               dismissable={true}
               onDismiss={onDismiss}
            />
         </div>
      );
   }  

   if (state.getState() === EUIState.kError) {
      error = (
         <div className={columnElementClasses.root}>
            &nbsp;&nbsp;&nbsp;                  
            <Message
               intent={MessageIntent.kError}
               title={uiStrings.kError}
               body={uiStrings.kServerErrorDescription}
               dismissable={true}
               onDismiss={onDismiss}
            />
         </div>
      );
   }

   if (
      (state.getState() === EUIState.kScreening ||
         state.getState() === EUIState.kChatting ||
         state.getState() === EUIState.kWaiting) &&
      streamedResponse
   ) {
      success = (
         <div className={columnElementClasses.root}>
            &nbsp;&nbsp;&nbsp;                  
            <CopyableText 
               placeholder={uiStrings.kResponsePlaceholder} 
               text={streamedResponse} 
            />
         </div>
      );
   }

   return (
      <div className={pageOuterClasses.root}>
         <div className={innerColumnClasses.root}>
            <Text className={textClasses.heading}>{uiStrings.kAppPageCaption}</Text>
            <Text className={textClasses.centredHint}>{uiStrings.kAppPageStrapline}</Text>
            <Spacer />
            {[uiStrings.kLinks].map(markdownLinks => {
               return markdownLinks.split(',').map((link, index) => {
                  // Extract URL and text from markdown format [text](url)
                  const matches = link.match(/\[(.*?)\]\((.*?)\)/);
                  if (matches) {
                     const [_, text, url] = matches;
                     return (
                        <FluentLink key={index} href={url} className={linkClasses.left} target="_blank">{text}</FluentLink>
                     );
                  }
                  return null;
               });
            })}
            <Spacer />
            <MultilineEdit {...multilineEditProps} />
            {offTopic}
            {error}
            {success}
            <Spacer />
            <Footer />
         </div>
      </div>
   );
}

