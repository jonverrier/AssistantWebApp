"use strict";
/**
 * AppEntry.tsx
 *
 * Main entry point for the application. Sets up the Fluent UI provider and
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
exports.App = exports.innerColumnStyles = void 0;
// React
const react_1 = __importStar(require("react"));
const client_1 = require("react-dom/client");
// Fluent
const react_components_1 = require("@fluentui/react-components");
const MultilineEdit_1 = require("./MultilineEdit");
const UIStrings_1 = require("./UIStrings");
const CommonStyles_1 = require("./CommonStyles");
const CopyableText_1 = require("./CopyableText");
const Message_1 = require("./Message");
const UIStateMachine_1 = require("./UIStateMachine");
const kFontNameForTextWrapCalculation = "12pt Segoe UI";
const kRequirementMaxLength = 4096;
const fluidFillPageStyles = (0, react_components_1.makeStyles)({
    root: {
        minWidth: "512px", // Ask for enough for at least the error message, plus don't crowd the entry text box - this is a trial value at 512    
    },
});
const pageOuterStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch', /* for a row, the main axis is vertical, flex-end is items aligned to the bottom of the row */
        justifyContent: 'center', /* for a row, the cross-axis is horizontal, center means vertically centered */
        height: '100vh', /* fill the screen with flex layout */
        width: '100%', /* fill the screen with flex layout */
        marginLeft: '0px',
        marginRight: '0px',
        marginTop: '0px',
        marginBottom: '0px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '20px',
        paddingBottom: '20px',
        webkitTextSizeAdjust: '100%'
    },
});
exports.innerColumnStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', // start layout at the top       
        alignItems: 'center',
        maxWidth: "896px",
        width: "100%"
    },
});
const App = (props) => {
    const fluidFillPageClasses = fluidFillPageStyles();
    const pageOuterClasses = pageOuterStyles();
    const innerColumnClasses = (0, exports.innerColumnStyles)();
    const textClasses = (0, CommonStyles_1.standardTextStyles)();
    const linkClasses = (0, CommonStyles_1.standardLinkStyles)();
    let [state, setState] = (0, react_1.useState)(new UIStateMachine_1.LinterUIStateMachine(UIStateMachine_1.EUIState.Waiting));
    const [message, setMessage] = (0, react_1.useState)("");
    const onSend = (message_) => {
        setMessage(message_);
    };
    const onChange = (message_) => {
        setMessage(message_);
    };
    const multilineEditProps = {
        caption: UIStrings_1.EUIStrings.kRequirementPreamble,
        placeholder: UIStrings_1.EUIStrings.kRequirementPlaceholder,
        maxLength: kRequirementMaxLength,
        message: message,
        enabled: true,
        fontNameForTextWrapCalculation: kFontNameForTextWrapCalculation,
        onSend: onSend,
        onChange: onChange,
    };
    return (react_1.default.createElement(react_components_1.FluentProvider, { theme: react_components_1.teamsDarkTheme, className: fluidFillPageClasses.root },
        react_1.default.createElement("div", { className: pageOuterClasses.root },
            react_1.default.createElement("div", { className: innerColumnClasses.root },
                react_1.default.createElement(react_components_1.Text, { className: textClasses.heading }, UIStrings_1.EUIStrings.kRequirementLinterCaption),
                react_1.default.createElement(react_components_1.Text, { className: textClasses.centredHint }, UIStrings_1.EUIStrings.kRequirementLinterStrapline),
                "\u00A0\u00A0\u00A0",
                react_1.default.createElement(react_components_1.Text, { className: textClasses.normal }, UIStrings_1.EUIStrings.kRequirementLinterDescription),
                react_1.default.createElement(react_components_1.Link, { href: "https://www.incose.org/docs/default-source/working-groups/requirements-wg/gtwr/incose_rwg_gtwr_v4_040423_final_drafts.pdf", className: linkClasses.left, target: "_blank" }, UIStrings_1.EUIStrings.kGtwr),
                react_1.default.createElement(react_components_1.Link, { href: "https://github.com/jonverrier/RequirementsLinter", className: linkClasses.left, target: "_blank" }, UIStrings_1.EUIStrings.kRepo),
                "\u00A0\u00A0\u00A0",
                react_1.default.createElement(MultilineEdit_1.MultilineEdit, { ...multilineEditProps }),
                "\u00A0\u00A0\u00A0",
                react_1.default.createElement(Message_1.Message, { intent: Message_1.MessageIntent.kWarning, title: UIStrings_1.EUIStrings.kWarning, body: UIStrings_1.EUIStrings.kNotARequirement, dismissable: true }),
                react_1.default.createElement(Message_1.Message, { intent: Message_1.MessageIntent.kInfo, title: UIStrings_1.EUIStrings.kInfo, body: UIStrings_1.EUIStrings.kProcessing, dismissable: false }),
                "\u00A0\u00A0\u00A0",
                react_1.default.createElement(CopyableText_1.CopyableText, { placeholder: UIStrings_1.EUIStrings.kReviewPlaceholder, text: "" }),
                "\u00A0\u00A0\u00A0",
                react_1.default.createElement(CopyableText_1.CopyableText, { placeholder: UIStrings_1.EUIStrings.kImprovedPlaceholder, text: "The cat sat on the mat." }),
                "\u00A0\u00A0\u00A0"))));
};
exports.App = App;
// This allows code to be loaded in node.js for tests, even if we dont run actual React methods
if (document !== undefined && document.getElementById !== undefined) {
    const root = (0, client_1.createRoot)(document.getElementById("reactRoot"));
    root.render(react_1.default.createElement(exports.App, null));
}
