"use strict";
/**
 * CopyableText.tsx
 *
 * A reusable component that displays text with a copy-to-clipboard button.
 * Provides a clean interface for displaying and copying text content.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyableText = exports.copyableTextButtonRowStyles = exports.copyableTextStyles = void 0;
/*! Copyright Jon Verrier 2025 */
// React
const react_1 = __importDefault(require("react"));
// Fluent
const react_components_1 = require("@fluentui/react-components");
const react_icons_1 = require("@fluentui/react-icons");
const CommonStyles_1 = require("./CommonStyles");
exports.copyableTextStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', // start layout at the top       
        alignItems: 'left',
        width: "100%",
        //...shorthands.borderColor("gray"),
        //...shorthands.borderWidth("1px"),
        //...shorthands.borderStyle("solid"),
        //borderRadius: "4px",
        padding: "4px"
    },
});
exports.copyableTextButtonRowStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end', // start layout at the right       
        alignItems: 'right',
        width: "100%"
    },
});
const CopyableText = (props) => {
    const textClasses = (0, CommonStyles_1.standardTextStyles)();
    const copyableTextClasses = (0, exports.copyableTextStyles)();
    const copyableTextButtonRowClasses = (0, exports.copyableTextButtonRowStyles)();
    const copyToClipboard = () => {
        navigator.clipboard.writeText(props.text)
            .then(() => {
            // Optional: Add visual feedback that text was copied
        })
            .catch(err => {
        });
    };
    return (react_1.default.createElement("div", { className: textClasses.root }, props.text.length > 0 ?
        react_1.default.createElement("div", { className: copyableTextClasses.root },
            react_1.default.createElement("div", { className: copyableTextButtonRowClasses.root },
                react_1.default.createElement(react_components_1.Toolbar, { "aria-label": "Default", ...props },
                    react_1.default.createElement(react_components_1.ToolbarButton, { "aria-label": "Copy", appearance: "subtle", icon: react_1.default.createElement(react_icons_1.CopyRegular, null), onClick: copyToClipboard }))),
            props.text.split('\n').map((line, index) => {
                const myId = props.id + '-' + index;
                return react_1.default.createElement(react_components_1.Text, { key: index, className: textClasses.normal, id: myId, "data-testid": myId }, line);
            }))
        : react_1.default.createElement(react_components_1.Text, { className: textClasses.normalGrey, id: props.id, "data-testid": props.id }, props.placeholder)));
};
exports.CopyableText = CopyableText;
