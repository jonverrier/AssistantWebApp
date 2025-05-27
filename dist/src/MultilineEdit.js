"use strict";
/**
 * MultilineEdit.tsx
 *
 * A reusable component that provides a multiline text input field with dynamic height adjustment.
 * Supports text wrapping calculations and character limit enforcement. Integrates with Fluent UI
 * components for consistent styling and behavior.
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
exports.MultilineEdit = void 0;
exports.wrapText = wrapText;
exports.calculateDyNeeded = calculateDyNeeded;
/*! Copyright Jon Verrier, 2025 */
// React
const react_1 = __importStar(require("react"));
// Fluent
const react_components_1 = require("@fluentui/react-components");
const react_icons_1 = require("@fluentui/react-icons");
const CommonStyles_1 = require("./CommonStyles");
const MultilineEditUIStrings_1 = require("./MultilineEditUIStrings");
function wrapText(context, text, width, defaultHeight, defaultWidth, lineSeparation) {
    let y = 0;
    let hardLines = text.split("\n");
    // Special case if we dont have any text - allow provision for one line
    if (hardLines.length === 0)
        return defaultHeight;
    let dy = 0;
    let lines = 0;
    for (var iHardLines = 0; iHardLines < hardLines.length; iHardLines++) {
        var line = "";
        var words = hardLines[iHardLines].split(" ");
        var lineWidth = 0;
        var lineHeightDelta = defaultHeight;
        for (var iWords = 0; iWords < words.length; iWords++) {
            var testLine = line + words[iWords] + " ";
            var testWidth;
            if (context) {
                let metrics = context.measureText(testLine);
                testWidth = metrics.width;
                lineHeightDelta = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            }
            else {
                testWidth = defaultWidth * testLine.length;
                lineHeightDelta = defaultHeight;
            }
            // Finish if we have incrementally exceeded maxWidth, 
            // or if we only have one word so we have to finish any way. 
            if ((testWidth > width) || ((testWidth > width) && iWords === 0)) {
                line = words[iWords] + " ";
                y += lineHeightDelta;
                dy += lineHeightDelta;
                lineWidth = (testWidth - lineWidth) - defaultWidth / 2;
                lines++;
                if ((iWords + 1) < words.length)
                    dy += lineSeparation;
            }
            else {
                line = testLine;
                lineWidth = testWidth - defaultWidth / 2;
            }
        }
        if (context) {
            let metrics = context.measureText(line);
            testWidth = metrics.width;
            lineHeightDelta = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        }
        else {
            testWidth = defaultWidth * line.length;
            lineHeightDelta = defaultHeight;
        }
        y += lineHeightDelta;
        dy += lineHeightDelta;
        lines++;
        if ((iHardLines + 1) < hardLines.length)
            dy += lineSeparation;
    }
    return dy;
}
// Ref
// https://blog.steveasleep.com/how-to-draw-multi-line-text-on-an-html-canvas-in-2021
function calculateDyNeeded(width, value, font, messagePrompt2HBorder, messagePromptLineSpace, defaultHeightLines) {
    const smallestTextForWrap = "A";
    let offScreenCanvas = new OffscreenCanvas(width, width * 10);
    if (!offScreenCanvas)
        throw new TypeError("Failed to create offscreen canvas");
    let offscreenContext = offScreenCanvas.getContext("2d");
    offscreenContext.font = font;
    let metrics = offscreenContext.measureText(smallestTextForWrap);
    let spaceCharWidth = metrics.width;
    let spaceCharHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    let dyNeeded = wrapText(offscreenContext, value.length > 0 ? value : smallestTextForWrap, width - messagePrompt2HBorder, spaceCharHeight, spaceCharWidth, messagePromptLineSpace);
    let minRows = "A" + "\n".repeat(defaultHeightLines - 1) + "A";
    let dyMin = wrapText(offscreenContext, minRows, width, spaceCharHeight, spaceCharWidth, messagePromptLineSpace);
    let tenRows = "A\nA\nA\nA\nA\nA\nA\nA\nA\nA\n";
    let dyMax = wrapText(offscreenContext, tenRows, width, spaceCharHeight, spaceCharWidth, messagePromptLineSpace);
    // Tidy up
    offScreenCanvas = null;
    offscreenContext = null;
    return Math.max(dyMin, Math.min(dyMax, dyNeeded));
}
const MultilineEdit = (props) => {
    const textFieldClasses = (0, CommonStyles_1.standardTextStyles)();
    const columnClasses = (0, CommonStyles_1.standardCenteredRowElementStyles)();
    const [width, setWidth] = (0, react_1.useState)(0);
    const textareaRef = (0, react_1.useRef)(null);
    // extract the first number from the font string
    const fontSize = parseInt(props.fontNameForTextWrapCalculation.match(/\d+/)?.[0] || "12");
    const kMessagePrompt2VBorder = fontSize * 2; // How much to allow for top + bottom inset
    const kMessagePrompt2HBorder = fontSize * 2; // How much to allow for left & right inset
    const kMessagePromptLineSpace = Math.floor(fontSize * 9 / 16); // How much to allow between lines      
    // Focus management
    (0, react_1.useEffect)(() => {
        if (props.enabled && textareaRef.current) {
            try {
                textareaRef.current.focus();
            }
            catch (e) {
                // Ignore focus errors in test environment
                console.warn('Focus error in test environment:', e);
            }
        }
    }, [props.enabled, props.message]);
    // Dynamic function to capture the width as we need it for calculations to reset height as the content text grows
    (0, react_1.useLayoutEffect)(() => {
        if (textareaRef.current) {
            let dx = textareaRef.current.offsetWidth;
            if (width !== dx) {
                setWidth(dx);
            }
        }
    }, []);
    function onKeyChange(ev, data) {
        if (data.value.length <= props.maxLength) {
            props.onChange(data.value);
        }
        else {
            props.onChange(data.value.substring(0, props.maxLength));
        }
    }
    /*
    * looks to see if the user has Ctrl-enter, and if so processes a Commit
    * @param event - Keyboard Event
    * @param value - current text value
    */
    function onSend(event, value) {
        var processed = false;
        switch (event.key) {
            case 'Enter':
                if (event.ctrlKey) {
                    props.onSend(value);
                    processed = true;
                }
                break;
            case 'Escape':
                props.onChange("");
                processed = true;
                break;
            default:
                break;
        }
        if (processed) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
    ;
    function onClick(event) {
        props.onSend(props.message);
    }
    let bump = kMessagePrompt2VBorder;
    var dyNeeded = bump;
    if (width !== 0)
        dyNeeded = calculateDyNeeded(width, props.message, props.fontNameForTextWrapCalculation, kMessagePrompt2HBorder, kMessagePromptLineSpace, props.defaultHeightLines) + bump;
    return (react_1.default.createElement("div", { style: { width: '100%', maxWidth: '100%' } },
        react_1.default.createElement(react_components_1.Text, { className: textFieldClasses.normal, style: {
                width: '100%',
                paddingLeft: '4px',
                paddingRight: '4px',
                display: 'block' // This ensures the text behaves as a block element
            } }, props.caption),
        react_1.default.createElement(react_components_1.Textarea, { ref: textareaRef, appearance: "outline", placeholder: props.placeholder, maxLength: props.maxLength, textarea: { className: textFieldClasses.textarea, style: { paddingLeft: '4px', paddingRight: '4px' } }, resize: "none", value: props.message, onChange: onKeyChange, disabled: !props.enabled, style: {
                height: (dyNeeded).toString() + 'px',
                width: '100%',
                paddingLeft: '4px',
                paddingRight: '4px'
            }, onKeyDown: (e) => onSend(e, props.message) }),
        react_1.default.createElement("div", { className: columnClasses.root },
            react_1.default.createElement(react_components_1.Text, { className: textFieldClasses.centredHint }, MultilineEditUIStrings_1.EMultilineEditUIStrings.kMessageTextPrompt),
            react_1.default.createElement(react_components_1.Toolbar, { "aria-label": "Default" },
                react_1.default.createElement(react_components_1.ToolbarButton, { "aria-label": "Send", appearance: "subtle", icon: react_1.default.createElement(react_icons_1.SendRegular, null), onClick: onClick, disabled: !props.enabled || props.message.length === 0 })))));
};
exports.MultilineEdit = MultilineEdit;
