/**
 * OuterStyles.ts
 * 
 * Defines styles for the main page layout components using Fluent UI's makeStyles.
 * Includes styles for the outer page container and inner column layout.
 */

/*! Copyright Jon Verrier 2025 */


import { makeStyles } from "@fluentui/react-components";

export const pageOuterStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',    /* for a row, the main axis is vertical, flex-end is items aligned to the bottom of the row */
      justifyContent: 'center', /* for a row, the cross-axis is horizontal, center means vertically centered */
      height: '100%',           /* fill the screen with flex layout */ 
      minHeight: '100vh',      
      width: '100%',            /* fill the screen with flex layout */  
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

export const innerColumnStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',    // start layout at the top       
      alignItems: 'center',
      maxWidth: "896px",
      width: "100%"
   },
});

export const innerColumnWhiteboardStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',    // start layout at the top       
      alignItems: 'center',
      maxWidth: "896px",
      width: "100%",
      backgroundImage: "url('assets/img/board-512x384.png')",
      backgroundRepeat: "repeat",
      opacity: 0.75
   },
});