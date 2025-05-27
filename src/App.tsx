/**
 * App.tsx
 * 
 * Main part. Sets up the Fluent UI provider and
 * renders the core application components. Handles the main layout and
 * styling of the application interface.
 */
/*! Copyright Jon Verrier 2025 */

// React
import React, { useState, useEffect, useRef } from 'react';

// Fluent
import {
   Text,
   Link as FluentLink, Spinner, makeStyles 
} from '@fluentui/react-components';

// external packages
import { ChatMessageClassName, EChatRole, IChatMessage } from 'prompt-repository';
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';

// local packages
import { IMultilineEditProps, MultilineEdit } from './MultilineEdit';
import { EAppMode, getUIStrings } from './UIStrings';
import { standardTextStyles, standardLinkStyles, standardColumnElementStyles} from './CommonStyles';
import { Message, MessageIntent } from './Message';
import { AssistantUIStateMachine, EUIState, EApiEvent } from './UIStateMachine';
import { processChat } from './ChatCall';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { Spacer, Footer } from './SiteUtilities';
import { ChatHistory, ChatMessage } from './ChatHistory';
import { processChatHistory } from './ChatHistoryCall';
import { archive, shouldArchive } from './ArchiveCall';

// Local version that works in browser
// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

const kFontNameForTextWrapCalculation = "12pt Segoe UI";
const kRequirementMaxLength = 4096;
const kChatHistoryPageSize = 50;
const kIdleTimeoutMs = 30000; // 30 seconds in milliseconds
const kSummaryLength = 200;
const kIdleCheckIntervalMs = 5000; // Check every 5 seconds

const scrollableContentStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      width: '100%',
      position: 'relative',
      height: '100%',
      paddingBottom: 'var(--footer-height)'
   }
});

const multilineEditContainerStyles = makeStyles({
   root: {
      position: 'sticky',
      bottom: 0,
      width: '100%',
      backgroundColor: 'transparent',
      paddingTop: '12px',
      zIndex: 1
   }
});

export interface IAppProps {
   appMode: EAppMode;
   forceNode: boolean;
   userName: string;
   sessionId: string;
}

const local = window.location.hostname === 'localhost';

const kMinArchivingDisplayMs = 2000;

export const App = (props: IAppProps) => {
   
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles ();
   const columnElementClasses = standardColumnElementStyles();
   const textClasses = standardTextStyles();   
   const linkClasses = standardLinkStyles();
   const scrollableContentClasses = scrollableContentStyles();
   const multilineEditContainerClasses = multilineEditContainerStyles();
   const bottomRef = useRef<HTMLDivElement>(null);

   const screenUrl = local ? 'http://localhost:7071/api/ScreenInput' : 'https://motifassistantapi.azurewebsites.net/api/ScreenInput';
   const chatUrl = local ? 'http://localhost:7071/api/StreamChat' : 'https://motifassistantapi.azurewebsites.net/api/StreamChat';
   const messagesApiUrl = local ? 'http://localhost:7071/api/GetMessages' : 'https://motifassistantapi.azurewebsites.net/api/GetMessages';
   const archiveApiUrl = local ? 'http://localhost:7071/api/ArchiveMessages' : 'https://motifassistantapi.azurewebsites.net/api/ArchiveMessages';
   const summariseApiUrl = local ? 'http://localhost:7071/api/SummariseMessages' : 'https://motifassistantapi.azurewebsites.net/api/SummariseMessages';

   const uiStrings = getUIStrings(props.appMode);

   let [state, setState] = useState<AssistantUIStateMachine>(new AssistantUIStateMachine(EUIState.kWaiting));
   
   const [chatHistory, setChatHistory] = useState<IChatMessage[]>([]);
   const [message, setMessage] = useState<string|undefined>(undefined);
   const [streamedResponse, setStreamedResponse] = useState<string|undefined>(undefined);
   const [streamedResponseId, setStreamedResponseId] = useState<string|undefined>(undefined);
   const [idleSince, setIdleSince] = useState<Date>(new Date());

   useEffect(() => {
      const loadChatHistory = async () => {
         // Show loading state while fetching history
         state.transition(EApiEvent.kStartedLoading);
         setState(new AssistantUIStateMachine(state.getState()));

         try {
            await processChatHistory({
               messagesApiUrl,
               sessionId: props.sessionId,
               limit: kChatHistoryPageSize,
               onPage: (messages) => {
                  setChatHistory(prev => [...prev, ...messages]);
               }
            });
            state.transition(EApiEvent.kFinishedLoading);
            setState(new AssistantUIStateMachine(state.getState()));
         } catch (error) {
            state.transition(EApiEvent.kError);
            setState(new AssistantUIStateMachine(state.getState()));
         }
      };
      loadChatHistory();
   }, [props.sessionId]);

   // Check for idle timeout
   useEffect(() => {
      const timer = setInterval(async () => {
         const idleTime = Date.now() - idleSince.getTime();

         if (idleTime >= kIdleTimeoutMs && state.getState() === EUIState.kWaiting) {
            if (shouldArchive(chatHistory)) {
               setIdleSince(new Date());
               setState(new AssistantUIStateMachine(EUIState.kArchiving));
               
               // Add minimum duration for archiving state
               setTimeout(async () => {
                  const newHistory = await archive({
                     archiveApiUrl : archiveApiUrl,
                     summarizeApiUrl : summariseApiUrl,
                     sessionId: props.sessionId,
                     messages: chatHistory,
                     wordCount: kSummaryLength,
                     updateState: handleStateUpdate
                  });
                  
                  setIdleSince(new Date());
                  setChatHistory(newHistory);
                  setState(new AssistantUIStateMachine(EUIState.kWaiting));
               }, kMinArchivingDisplayMs); // Minimum display time for archiving state
            }
         }
      }, kIdleCheckIntervalMs);

      return () => clearInterval(timer);
   }, [idleSince, chatHistory, props.sessionId, state]);

   const handleStateUpdate = (event: EApiEvent) => {
      state.transition(event);
      setState(new AssistantUIStateMachine(state.getState()));         
   };

   async function callChatServer() : Promise<void> {
      if (!message) return;
      
      let localMessage = message;
      setMessage(undefined); // Clear message once we go to get the response      

      // Reset streamed response
      setStreamedResponse("");
      setStreamedResponseId(uuidv4);

      // Keep track of the complete response
      let completeResponse = "";

      const result = await processChat({
         screeningApiUrl: screenUrl,
         chatApiUrl: chatUrl,
         input: localMessage,
         history: chatHistory,
         updateState: handleStateUpdate,
         sessionId: props.sessionId,
         personality: EAssistantPersonality.kTheYardAssistant,
         onChunk: (chunk: string) => {
            if (chunk) {
               completeResponse += chunk;
               setStreamedResponse(prev => prev + chunk);
            }
         },
         onComplete: () => {
            // Add the assistant message to the chat history when complete
            if (completeResponse) {
               setChatHistory(prev => [...prev, {
                  id: uuidv4(),
                  className: ChatMessageClassName,
                  role: EChatRole.kAssistant,
                  content: completeResponse,
                  timestamp: new Date()
               }]);
               setStreamedResponse(undefined);
               setStreamedResponseId(undefined);

            }
         },
         forceNode: props.forceNode
      });
   };
   
   const onDismiss = () => {
      setStreamedResponse(undefined);
      setStreamedResponseId(undefined);
      state.transition(EApiEvent.kReset);
      setState(new AssistantUIStateMachine(state.getState()));      
   };

   const onSend = (message_: string) => {
      // Add the user message to the chat history
      setMessage(message_);

      setChatHistory(prev => [...prev, {
         id: uuidv4(),
         className: ChatMessageClassName,
         role: EChatRole.kUser,
         content: message_,
         timestamp: new Date()
      }]);

      // Call the chat server - message will be cleared after processing
      callChatServer();
   };

   const onChange = (message_: string) => {
      setMessage(message_);
      setIdleSince(new Date()); // Reset idle timer on input change
      state.transition(EApiEvent.kReset);
      setState(new AssistantUIStateMachine(state.getState()));      
   };

   const multilineEditProps: IMultilineEditProps = {
      caption: uiStrings.kChatPreamble,
      placeholder: uiStrings.kChatPlaceholder,
      maxLength: kRequirementMaxLength,
      message: message || "",
      enabled: state.getState() === EUIState.kWaiting,
      fontNameForTextWrapCalculation: kFontNameForTextWrapCalculation,
      defaultHeightLines: 10,
      onSend: onSend,
      onChange: onChange,
   };
      

   let blank = <div></div>;
   let offTopic = blank;
   let error = blank;
   let archiving = blank;
   let streaming = blank;
   
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
   
   if (state.getState() === EUIState.kArchiving) {
      archiving = (
         <div className={columnElementClasses.root}>
            &nbsp;&nbsp;&nbsp;                  
            <Message
               intent={MessageIntent.kInfo}
               title={uiStrings.kArchivingPleaseWait}
               body={uiStrings.kArchivingDescription}
               dismissable={false}
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
      streaming = (
         <div className={columnElementClasses.root} data-testid="message-content">
            <ChatMessage 
               message={{
                  id: streamedResponseId,
                  className: ChatMessageClassName,
                  role: EChatRole.kAssistant,
                  content: streamedResponse,
                  timestamp: new Date()
               }}
            />
         </div>
      );
   }

   // Scroll to the bottom of the chat history when a response is received
   useEffect(() => {
      if (streamedResponse) {
         bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
   }, [streamedResponse]);

   // Scroll to the bottom when new chat history pages are loaded
   useEffect(() => {
      if (chatHistory.length > 0) {
         bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
   }, [chatHistory]);

   return (
      <div className={pageOuterClasses.root} data-session-id={props.sessionId}>
         <div className={innerColumnClasses.root}>
            <Text className={textClasses.heading}>{uiStrings.kAppPageCaption}</Text>
            <Text className={textClasses.centredHint}>{uiStrings.kAppPageStrapline}</Text>
            <Spacer />
            <Text>{uiStrings.kOverview}</Text>
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
            <div className={scrollableContentClasses.root}>
               <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {chatHistory.length > 0 && (
                     <div className={columnElementClasses.root}>
                        <ChatHistory messages={chatHistory} />
                     </div>
                  )}
                  {((state.getState() === EUIState.kScreening || 
                     state.getState() === EUIState.kChatting || 
                     state.getState() === EUIState.kLoading) && 
                    !streamedResponse) && (
                     <div className={columnElementClasses.root}>
                        <Spacer />
                        <Spinner label={uiStrings.kProcessingPleaseWait} />
                     </div>
                  )}
                  <div className={columnElementClasses.root}>
                     {streaming}
                  </div>
                  {offTopic}
                  {error}
                  {archiving}                  
                  <div ref={bottomRef} />
               </div>
               
               <div className={multilineEditContainerClasses.root}>
                  <MultilineEdit {...multilineEditProps} />
               </div>
            </div>
            <Spacer />
            <Footer />
         </div>
      </div>
   );
}

