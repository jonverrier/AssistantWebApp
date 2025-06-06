"use strict";
/**
 * CommonStyles.ts
 *
 * Defines common styling components used throughout the application.
 * Provides consistent text and link styling using Fluent UI's makeStyles.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardLinkStyles = exports.standardTextStyles = exports.mobileRowElementStyles = exports.standardJustifiedRowElementStyles = exports.standardCenteredRowElementStyles = exports.standardRowElementStyles = exports.standardColumnElementStyles = void 0;
/*! Copyright Jon Verrier 2025 */
const react_components_1 = require("@fluentui/react-components");
exports.standardColumnElementStyles = (0, react_components_1.makeStyles)({
    root: {
        width: '100%'
    },
});
exports.standardRowElementStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%'
    },
});
exports.standardCenteredRowElementStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        padding: '6px',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center'
    },
});
exports.standardJustifiedRowElementStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        padding: '6px',
        alignItems: 'center',
        alignSelf: 'center'
    },
});
exports.mobileRowElementStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        justifyContent: 'center',
        padding: '6px',
        alignItems: 'center',
        alignSelf: 'center'
    },
});
exports.standardTextStyles = (0, react_components_1.makeStyles)({
    root: {
        display: 'flex',
        flexDirection: 'column',
    },
    heading: {
        textAlign: 'center',
        fontSize: '16pt',
        fontWeight: 'bold',
        marginBottom: '12px'
    },
    subHeadingLeft: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontSize: '12pt',
        fontWeight: 'bold',
        marginTop: '12px',
        marginBottom: '12px'
    },
    normal: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontSize: '10pt',
        marginBottom: '10px'
    },
    normalGrey: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontSize: '10pt',
        color: 'grey',
        marginBottom: '10px'
    },
    textarea: {
        width: '100%',
        height: '100%',
        textAlign: 'left',
        verticalAlign: 'top',
    },
    centredHint: {
        textAlign: 'center',
        fontSize: '8pt',
        color: 'grey',
        marginTop: '8px',
        marginBottom: '8px'
    },
    footer: {
        textAlign: 'center',
        fontSize: '8pt',
        color: 'grey',
        marginTop: '12px'
    }
});
exports.standardLinkStyles = (0, react_components_1.makeStyles)({
    left: {
        textAlign: 'left',
        alignSelf: 'flex-start'
    },
    centred: {
        textAlign: 'center'
    }
});
