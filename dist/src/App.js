"use strict";
/**
 * App.tsx
 *
 * Main part. Sets up the Fluent UI provider and
 * renders the core application components. Handles the main layout and
 * styling of the application interface.
 */
/*! Copyright Jon Verrier 2025 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
// React
const react_1 = __importStar(require("react"));
// Fluent
const react_components_1 = require("@fluentui/react-components");
// external packages
const prompt_repository_1 = require("prompt-repository");
const AssistantChatApiTypes_1 = require("../import/AssistantChatApiTypes");
// local packages
const MultilineEdit_1 = require("./MultilineEdit");
const UIStrings_1 = require("./UIStrings");
const CommonStyles_1 = require("./CommonStyles");
const Message_1 = require("./Message");
const UIStateMachine_1 = require("./UIStateMachine");
const ChatCall_1 = require("./ChatCall");
const OuterStyles_1 = require("./OuterStyles");
const SiteUtilities_1 = require("./SiteUtilities");
const ChatHistory_1 = require("./ChatHistory");
const ChatHistoryCall_1 = require("./ChatHistoryCall");
const ArchiveCall_1 = require("./ArchiveCall");
const uuid_1 = require("./uuid");
const ConfigStrings_1 = require("./ConfigStrings");
const kFontNameForTextWrapCalculation = "12pt Segoe UI";
const kRequirementMaxLength = 4096;
const kChatHistoryPageSize = 50;
const kIdleTimeoutMs = 30000; // 30 seconds in milliseconds
const kSummaryLength = 200;
const kIdleCheckIntervalMs = 5000; // Check every 5 seconds
const scrollableContentStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        width: '100%',
        position: 'relative',
        height: '100%'
    }
});
const multilineEditContainerStyles = (0, react_components_1.makeStyles)({
    root: {
        position: 'sticky',
        bottom: 0,
        width: '100%',
        backgroundColor: 'transparent',
        paddingTop: '12px',
        zIndex: 1
    }
});
const kMinArchivingDisplayMs = 2000;
// App view component
// This component is responsible for rendering the main UI of the application.
// It includes the chat history, message input, and other UI elements.
const AppView = ({ uiStrings, state, chatHistory, streamedResponse, streamedResponseId, message, onSend, onChange, onDismiss, sessionId }) => {
    const bottomRef = (0, react_1.useRef)(null);
    const pageOuterClasses = (0, OuterStyles_1.pageOuterStyles)();
    const innerColumnClasses = (0, OuterStyles_1.innerColumnStyles)();
    const columnElementClasses = (0, CommonStyles_1.standardColumnElementStyles)();
    const textClasses = (0, CommonStyles_1.standardTextStyles)();
    const linkClasses = (0, CommonStyles_1.standardLinkStyles)();
    const scrollableContentClasses = scrollableContentStyles();
    const multilineEditContainerClasses = multilineEditContainerStyles();
    // Scroll to the bottom of the chat history when a response is received
    (0, react_1.useEffect)(() => {
        if (streamedResponse) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [streamedResponse]);
    // Scroll to the bottom when new chat history pages are loaded
    (0, react_1.useEffect)(() => {
        if (chatHistory.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory]);
    let blank = react_1.default.createElement("div", null);
    let offTopic = blank;
    let error = blank;
    let archiving = blank;
    let streaming = blank;
    if (state.getState() === UIStateMachine_1.EUIState.kOffTopic) {
        offTopic = (react_1.default.createElement("div", { className: columnElementClasses.root },
            "\u00A0\u00A0\u00A0",
            react_1.default.createElement(Message_1.Message, { intent: Message_1.MessageIntent.kWarning, title: uiStrings.kWarning, body: uiStrings.kLooksOffTopic, dismissable: true, onDismiss: onDismiss })));
    }
    if (state.getState() === UIStateMachine_1.EUIState.kError) {
        error = (react_1.default.createElement("div", { className: columnElementClasses.root },
            "\u00A0\u00A0\u00A0",
            react_1.default.createElement(Message_1.Message, { intent: Message_1.MessageIntent.kError, title: uiStrings.kError, body: uiStrings.kServerErrorDescription, dismissable: true, onDismiss: onDismiss })));
    }
    if (state.getState() === UIStateMachine_1.EUIState.kArchiving) {
        archiving = (react_1.default.createElement("div", { className: columnElementClasses.root },
            "\u00A0\u00A0\u00A0",
            react_1.default.createElement(Message_1.Message, { intent: Message_1.MessageIntent.kInfo, title: uiStrings.kArchivingPleaseWait, body: uiStrings.kArchivingDescription, dismissable: false })));
    }
    if ((state.getState() === UIStateMachine_1.EUIState.kScreening ||
        state.getState() === UIStateMachine_1.EUIState.kChatting ||
        state.getState() === UIStateMachine_1.EUIState.kWaiting) &&
        streamedResponse) {
        streaming = (react_1.default.createElement("div", { className: columnElementClasses.root, "data-testid": "message-content" },
            react_1.default.createElement(ChatHistory_1.ChatMessage, { message: {
                    id: streamedResponseId,
                    className: prompt_repository_1.ChatMessageClassName,
                    role: prompt_repository_1.EChatRole.kAssistant,
                    content: streamedResponse,
                    timestamp: new Date()
                } })));
    }
    const multilineEditProps = {
        caption: uiStrings.kChatPreamble,
        placeholder: uiStrings.kChatPlaceholder,
        maxLength: kRequirementMaxLength,
        message: message || "",
        enabled: state.getState() === UIStateMachine_1.EUIState.kWaiting,
        fontNameForTextWrapCalculation: kFontNameForTextWrapCalculation,
        defaultHeightLines: 10,
        onSend,
        onChange,
    };
    return (react_1.default.createElement("div", { className: pageOuterClasses.root, "data-session-id": sessionId },
        react_1.default.createElement("div", { className: innerColumnClasses.root },
            react_1.default.createElement(SiteUtilities_1.Header, { title: uiStrings.kAppPageCaption }),
            react_1.default.createElement(react_components_1.Text, { className: textClasses.centredHint }, uiStrings.kAppPageStrapline),
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            react_1.default.createElement(react_components_1.Text, null, uiStrings.kOverview),
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            [uiStrings.kLinks].map(markdownLinks => {
                return markdownLinks.split(',').map((link, index) => {
                    // Extract URL and text from markdown format [text](url)
                    const matches = link.match(/\[(.*?)\]\((.*?)\)/);
                    if (matches) {
                        const [_, text, url] = matches;
                        return (react_1.default.createElement(react_components_1.Link, { key: index, href: url, className: linkClasses.left, target: "_blank" }, text));
                    }
                    return null;
                });
            }),
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            react_1.default.createElement("div", { className: scrollableContentClasses.root },
                react_1.default.createElement("div", { style: { flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' } },
                    chatHistory.length > 0 && (react_1.default.createElement("div", { className: columnElementClasses.root },
                        react_1.default.createElement(ChatHistory_1.ChatHistory, { messages: chatHistory }))),
                    ((state.getState() === UIStateMachine_1.EUIState.kScreening ||
                        state.getState() === UIStateMachine_1.EUIState.kChatting ||
                        state.getState() === UIStateMachine_1.EUIState.kLoading) &&
                        !streamedResponse) && (react_1.default.createElement("div", { className: columnElementClasses.root },
                        react_1.default.createElement(SiteUtilities_1.Spacer, null),
                        react_1.default.createElement(react_components_1.Spinner, { label: uiStrings.kProcessingPleaseWait }))),
                    react_1.default.createElement("div", { className: columnElementClasses.root }, streaming),
                    offTopic,
                    error,
                    archiving,
                    react_1.default.createElement("div", { ref: bottomRef })),
                react_1.default.createElement("div", { className: multilineEditContainerClasses.root },
                    react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...multilineEditProps }))))));
};
// App component
// This component is responsible for managing the state of the application.
// It includes the managing the chat history, message input, streamed response from the server, 
// and other data elements.
const App = (props) => {
    const config = (0, ConfigStrings_1.getConfigStrings)();
    const uiStrings = (0, UIStrings_1.getUIStrings)(props.personality);
    let [state, setState] = (0, react_1.useState)(new UIStateMachine_1.AssistantUIStateMachine(UIStateMachine_1.EUIState.kWaiting));
    const [chatHistory, setChatHistory] = (0, react_1.useState)([]);
    const [message, setMessage] = (0, react_1.useState)(undefined);
    const [streamedResponse, setStreamedResponse] = (0, react_1.useState)(undefined);
    const [streamedResponseId, setStreamedResponseId] = (0, react_1.useState)(undefined);
    const [idleSince, setIdleSince] = (0, react_1.useState)(new Date());
    (0, react_1.useEffect)(() => {
        const loadChatHistory = async () => {
            // Show loading state while fetching history
            state.transition(UIStateMachine_1.EApiEvent.kStartedLoading);
            setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
            try {
                await (0, ChatHistoryCall_1.processChatHistory)({
                    messagesApiUrl: config.messagesApiUrl,
                    sessionSummary: {
                        sessionId: props.sessionId,
                        email: props.email
                    },
                    limit: kChatHistoryPageSize,
                    onPage: (messages) => {
                        setChatHistory(prev => [...prev, ...messages]);
                    }
                });
                state.transition(UIStateMachine_1.EApiEvent.kFinishedLoading);
                setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
            }
            catch (error) {
                state.transition(UIStateMachine_1.EApiEvent.kError);
                setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
            }
        };
        loadChatHistory();
    }, [props.sessionId]);
    // Check for idle timeout
    (0, react_1.useEffect)(() => {
        const timer = setInterval(async () => {
            const idleTime = Date.now() - idleSince.getTime();
            if (idleTime >= kIdleTimeoutMs && state.getState() === UIStateMachine_1.EUIState.kWaiting) {
                if ((0, ArchiveCall_1.shouldArchive)(chatHistory)) {
                    setIdleSince(new Date());
                    setState(new UIStateMachine_1.AssistantUIStateMachine(UIStateMachine_1.EUIState.kArchiving));
                    // Add minimum duration for archiving state
                    setTimeout(async () => {
                        const newHistory = await (0, ArchiveCall_1.archive)({
                            archiveApiUrl: config.archiveApiUrl,
                            summarizeApiUrl: config.summariseApiUrl,
                            sessionSummary: {
                                sessionId: props.sessionId,
                                email: props.email
                            },
                            messages: chatHistory,
                            wordCount: kSummaryLength,
                            updateState: handleStateUpdate
                        });
                        setIdleSince(new Date());
                        setChatHistory(newHistory);
                        setState(new UIStateMachine_1.AssistantUIStateMachine(UIStateMachine_1.EUIState.kWaiting));
                    }, kMinArchivingDisplayMs); // Minimum display time for archiving state
                }
            }
        }, kIdleCheckIntervalMs);
        return () => clearInterval(timer);
    }, [idleSince, chatHistory, props.sessionId, state]);
    const handleStateUpdate = (event) => {
        state.transition(event);
        setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
    };
    async function callChatServer() {
        if (!message)
            return;
        let localMessage = message;
        setMessage(undefined); // Clear message once we go to get the response      
        // Reset streamed response
        setStreamedResponse("");
        setStreamedResponseId(uuid_1.uuidv4);
        // Keep track of the complete response
        let completeResponse = "";
        const result = await (0, ChatCall_1.processChat)({
            screeningApiUrl: config.screenUrl,
            chatApiUrl: config.chatUrl,
            input: localMessage,
            history: chatHistory,
            updateState: handleStateUpdate,
            sessionSummary: {
                sessionId: props.sessionId,
                email: props.email
            },
            personality: AssistantChatApiTypes_1.EAssistantPersonality.kTheYardAssistant,
            onChunk: (chunk) => {
                if (chunk) {
                    completeResponse += chunk;
                    setStreamedResponse(prev => prev + chunk);
                }
            },
            onComplete: () => {
                // Add the assistant message to the chat history when complete
                if (completeResponse) {
                    setChatHistory(prev => [...prev, {
                            id: (0, uuid_1.uuidv4)(),
                            className: prompt_repository_1.ChatMessageClassName,
                            role: prompt_repository_1.EChatRole.kAssistant,
                            content: completeResponse,
                            timestamp: new Date()
                        }]);
                    setStreamedResponse(undefined);
                    setStreamedResponseId(undefined);
                }
            }
        });
    }
    ;
    const onDismiss = () => {
        setStreamedResponse(undefined);
        setStreamedResponseId(undefined);
        state.transition(UIStateMachine_1.EApiEvent.kReset);
        setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
    };
    const onSend = (message_) => {
        // Add the user message to the chat history
        setMessage(message_);
        setChatHistory(prev => [...prev, {
                id: (0, uuid_1.uuidv4)(),
                className: prompt_repository_1.ChatMessageClassName,
                role: prompt_repository_1.EChatRole.kUser,
                content: message_,
                timestamp: new Date()
            }]);
        // Call the chat server - message will be cleared after processing
        callChatServer();
    };
    const onChange = (message_) => {
        setMessage(message_);
        setIdleSince(new Date()); // Reset idle timer on input change
        state.transition(UIStateMachine_1.EApiEvent.kReset);
        setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
    };
    return (react_1.default.createElement(AppView, { uiStrings: uiStrings, state: state, chatHistory: chatHistory, streamedResponse: streamedResponse, streamedResponseId: streamedResponseId, message: message || "", onSend: onSend, onChange: onChange, onDismiss: onDismiss, sessionId: props.sessionId }));
};
exports.App = App;
