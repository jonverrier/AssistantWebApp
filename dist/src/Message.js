"use strict";
/**
 * Message.tsx
 *
 * A reusable component that displays messages with different intents (info, warning, error).
 * Uses Fluent UI MessageBar to provide consistent message styling and layout.
 */
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
exports.Message = exports.MessageIntent = void 0;
/*! Copyright Jon Verrier 2025 */
// React
const react_1 = __importStar(require("react"));
// Fluent
const react_components_1 = require("@fluentui/react-components");
const react_icons_1 = require("@fluentui/react-icons");
const CommonStyles_1 = require("./CommonStyles");
/**
 * MessageIntent enum
 *
 * Represents the different intents for messages.
 */
var MessageIntent;
(function (MessageIntent) {
    MessageIntent["kInfo"] = "info";
    MessageIntent["kWarning"] = "warning";
    MessageIntent["kError"] = "error";
})(MessageIntent || (exports.MessageIntent = MessageIntent = {}));
/**
 * Message component
 *
 * Displays a message with a title, body, and optional dismiss button.
 */
const Message = (props) => {
    const messageClasses = (0, CommonStyles_1.standardColumnElementStyles)();
    const [isDismissed, setIsDismissed] = (0, react_1.useState)(false);
    const onDismiss = () => {
        setIsDismissed(true);
        props.onDismiss?.();
    };
    return (!isDismissed && (react_1.default.createElement(react_components_1.MessageBarGroup, { className: messageClasses.root },
        react_1.default.createElement(react_components_1.MessageBar, { intent: props.intent },
            react_1.default.createElement(react_components_1.MessageBarBody, null,
                react_1.default.createElement(react_components_1.MessageBarTitle, null, props.title),
                props.body),
            props.dismissable && (react_1.default.createElement(react_components_1.MessageBarActions, { containerAction: react_1.default.createElement(react_components_1.Button, { "aria-label": "dismiss", appearance: "transparent", icon: react_1.default.createElement(react_icons_1.DismissRegular, null), onClick: onDismiss }) }))))));
};
exports.Message = Message;
