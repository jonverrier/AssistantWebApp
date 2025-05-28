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
   Link as FluentLink, Spinner, makeStyles, Image 
} from '@fluentui/react-components';

// external packages
import { ChatMessageClassName, EChatRole, IChatMessage } from 'prompt-repository';
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';

// local packages
import { IMultilineEditProps, MultilineEdit } from './MultilineEdit';
import { getUIStrings } from './UIStrings';
import { standardTextStyles, standardLinkStyles, standardColumnElementStyles} from './CommonStyles';
import { Message, MessageIntent } from './Message';
import { AssistantUIStateMachine, EUIState, EApiEvent } from './UIStateMachine';
import { processChat } from './ChatCall';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { Spacer, Footer, Header } from './SiteUtilities';
import { ChatHistory, ChatMessage } from './ChatHistory';
import { processChatHistory } from './ChatHistoryCall';
import { archive, shouldArchive } from './ArchiveCall';
import { uuidv4 } from './uuid';
import { getConfigStrings } from './ConfigStrings';

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

// App component props
export interface IAppProps {
   personality: EAssistantPersonality;
   sessionId: string;
   userName: string;
   onLogout: () => Promise<void>;
}

const kMinArchivingDisplayMs = 2000;

// App view component props
interface IAppViewProps {
   uiStrings: any;
   state: AssistantUIStateMachine;
   chatHistory: IChatMessage[];
   streamedResponse?: string;
   streamedResponseId?: string;
   message: string;
   onSend: (message: string) => void;
   onChange: (message: string) => void;
   onDismiss: () => void;
   sessionId: string;
}

// App view component
// This component is responsible for rendering the main UI of the application.
// It includes the chat history, message input, and other UI elements.
const AppView: React.FC<IAppViewProps> = ({
   uiStrings,
   state,
   chatHistory,
   streamedResponse,
   streamedResponseId,
   message,
   onSend,
   onChange,
   onDismiss,
   sessionId
}) => {
   const config = getConfigStrings();
   const bottomRef = useRef<HTMLDivElement>(null);
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const columnElementClasses = standardColumnElementStyles();
   const textClasses = standardTextStyles();   
   const linkClasses = standardLinkStyles();
   const scrollableContentClasses = scrollableContentStyles();
   const multilineEditContainerClasses = multilineEditContainerStyles();

   const lifterIcon = 'assets/img/lifter-w.png';

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

   const multilineEditProps: IMultilineEditProps = {
      caption: uiStrings.kChatPreamble,
      placeholder: uiStrings.kChatPlaceholder,
      maxLength: kRequirementMaxLength,
      message: message || "",
      enabled: state.getState() === EUIState.kWaiting,
      fontNameForTextWrapCalculation: kFontNameForTextWrapCalculation,
      defaultHeightLines: 10,
      onSend,
      onChange,
   };

   return (
      <div className={pageOuterClasses.root} data-session-id={sessionId}>
         <div className={innerColumnClasses.root}>
            <Header title={uiStrings.kAppPageCaption} />
            <Text className={textClasses.centredHint}>{uiStrings.kAppPageStrapline}</Text>
            <Spacer />
            <Text>{uiStrings.kOverview}</Text>
            <Spacer />
            {[uiStrings.kLinks].map(markdownLinks => {
               return markdownLinks.split(',').map((link: string, index: number) => {
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
};

// App component
// This component is responsible for managing the state of the application.
// It includes the managing the chat history, message input, streamed response from the server, 
// and other data elements.
export const App = (props: IAppProps) => {
   const config = getConfigStrings();
   const uiStrings = getUIStrings(props.personality);
   
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
               messagesApiUrl: config.messagesApiUrl,
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
                     archiveApiUrl: config.archiveApiUrl,
                     summarizeApiUrl: config.summariseApiUrl,
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
         screeningApiUrl: config.screenUrl,
         chatApiUrl: config.chatUrl,
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
         }
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

   return (
      <AppView
         uiStrings={uiStrings}
         state={state}
         chatHistory={chatHistory}
         streamedResponse={streamedResponse}
         streamedResponseId={streamedResponseId}
         message={message || ""}
         onSend={onSend}
         onChange={onChange}
         onDismiss={onDismiss}
         sessionId={props.sessionId}
      />
   );
}

