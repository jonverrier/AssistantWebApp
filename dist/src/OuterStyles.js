"use strict";
/**
 * OuterStyles.ts
 *
 * Defines styles for the main page layout components using Fluent UI's makeStyles.
 * Includes styles for the outer page container and inner column layout.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.innerColumnStyles = exports.pageOuterStyles = void 0;
/*! Copyright Jon Verrier 2025 */
const react_components_1 = require("@fluentui/react-components");
exports.pageOuterStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch', /* for a row, the main axis is vertical, flex-end is items aligned to the bottom of the row */
        justifyContent: 'center', /* for a row, the cross-axis is horizontal, center means vertically centered */
        height: '100%', /* fill the screen with flex layout */
        minHeight: '100vh',
        width: '100%', /* fill the screen with flex layout */
        minWidth: '100vw',
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
