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
exports.App = exports.activeFieldId = void 0;
// React
const react_1 = __importStar(require("react"));
// Fluent
const react_components_1 = require("@fluentui/react-components");
// external packages
const AssistantChatApiTypes_1 = require("../import/AssistantChatApiTypes");
// local packages
const MultilineEdit_1 = require("./MultilineEdit");
const UIStrings_1 = require("./UIStrings");
const CommonStyles_1 = require("./CommonStyles");
const CopyableText_1 = require("./CopyableText");
const Message_1 = require("./Message");
const UIStateMachine_1 = require("./UIStateMachine");
const Call_1 = require("./Call");
const OuterStyles_1 = require("./OuterStyles");
const SiteUtilities_1 = require("./SiteUtilities");
const Cookie_1 = require("./Cookie");
const kFontNameForTextWrapCalculation = "12pt Segoe UI";
const kRequirementMaxLength = 4096;
// Loca version that works in browser
//https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16));
}
// This is used to identify the session in the case where we dont get a value 
// back from the server which tells us our local cookie value
const newSessionUuid = uuidv4();
// This is used to identify the field into which the response is streamed.
exports.activeFieldId = uuidv4();
const local = true;
const App = (props) => {
    const pageOuterClasses = (0, OuterStyles_1.pageOuterStyles)();
    const innerColumnClasses = (0, OuterStyles_1.innerColumnStyles)();
    const columnElementClasses = (0, CommonStyles_1.standardColumnElementStyles)();
    const textClasses = (0, CommonStyles_1.standardTextStyles)();
    const linkClasses = (0, CommonStyles_1.standardLinkStyles)();
    const screenUrl = local ? 'http://localhost:7071/api/ScreenInput' : 'https://motifassistantapi.azurewebsites.net/api/ScreenInput';
    const chatUrl = local ? 'http://localhost:7071/api/StreamChat' : 'https://motifassistantapi.azurewebsites.net/api/StreamChat';
    const cookieApiUrl = local ? 'http://localhost:7071/api/Cookie' : 'https://motifassistantapi.azurewebsites.net/api/Cookie';
    const uiStrings = (0, UIStrings_1.getUIStrings)(props.appMode);
    let [state, setState] = (0, react_1.useState)(new UIStateMachine_1.AssistantUIStateMachine(UIStateMachine_1.EUIState.kWaiting));
    let [sessionUuid, setSessionUuid] = (0, react_1.useState)(newSessionUuid);
    (0, react_1.useEffect)(() => {
        const getCookie = async () => {
            const existingSession = await (0, Cookie_1.getSessionUuid)(cookieApiUrl);
            if (existingSession) {
                setSessionUuid(existingSession);
            }
        };
        getCookie();
    }, []);
    const [message, setMessage] = (0, react_1.useState)("");
    const [streamedResponse, setStreamedResponse] = (0, react_1.useState)(undefined);
    async function callServer() {
        if (!message)
            return;
        // Reset streamed response
        setStreamedResponse("");
        const result = await (0, Call_1.processChat)({
            screeningApiUrl: screenUrl,
            chatApiUrl: chatUrl,
            input: message,
            updateState: (event) => {
                state.transition(event);
                setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
            },
            sessionId: sessionUuid,
            personality: AssistantChatApiTypes_1.EAssistantPersonality.kMastersAdviser,
            onChunk: (chunk) => {
                setStreamedResponse(prev => prev + chunk);
            },
            forceNode: props.forceNode
        });
    }
    ;
    const onDismiss = () => {
        setStreamedResponse(undefined);
        state.transition(UIStateMachine_1.EApiEvent.kReset);
        setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
    };
    const onSend = (message_) => {
        setMessage(message_);
        callServer();
    };
    const onChange = (message_) => {
        setMessage(message_);
        state.transition(UIStateMachine_1.EApiEvent.kReset);
        setState(new UIStateMachine_1.AssistantUIStateMachine(state.getState()));
    };
    const multilineEditProps = {
        caption: uiStrings.kChatPreamble,
        placeholder: uiStrings.kChatPlaceholder,
        maxLength: kRequirementMaxLength,
        message: message,
        enabled: state.getState() === UIStateMachine_1.EUIState.kWaiting,
        fontNameForTextWrapCalculation: kFontNameForTextWrapCalculation,
        defaultHeightLines: 10,
        onSend: onSend,
        onChange: onChange,
    };
    let blank = react_1.default.createElement("div", null);
    let offTopic = blank;
    let error = blank;
    let success = blank;
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
    if ((state.getState() === UIStateMachine_1.EUIState.kScreening ||
        state.getState() === UIStateMachine_1.EUIState.kChatting ||
        state.getState() === UIStateMachine_1.EUIState.kWaiting) &&
        streamedResponse) {
        success = (react_1.default.createElement("div", { className: columnElementClasses.root },
            "\u00A0\u00A0\u00A0",
            react_1.default.createElement(CopyableText_1.CopyableText, { placeholder: uiStrings.kResponsePlaceholder, text: streamedResponse, id: exports.activeFieldId })));
    }
    return (react_1.default.createElement("div", { className: pageOuterClasses.root },
        react_1.default.createElement("div", { className: innerColumnClasses.root },
            react_1.default.createElement(react_components_1.Text, { className: textClasses.heading }, uiStrings.kAppPageCaption),
            react_1.default.createElement(react_components_1.Text, { className: textClasses.centredHint }, uiStrings.kAppPageStrapline),
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
            react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...multilineEditProps }),
            offTopic,
            error,
            success,
            react_1.default.createElement(SiteUtilities_1.Spacer, null),
            react_1.default.createElement(SiteUtilities_1.Footer, null))));
};
exports.App = App;
