/**
 * CommonStyles.ts
 * 
 * Defines common styling components used throughout the application.
 * Provides consistent text and link styling using Fluent UI's makeStyles.
 */

/*! Copyright Jon Verrier 2025 */

import { makeStyles } from '@fluentui/react-components';

export const standardColumnElementStyles = makeStyles({
   root: {
      width: '100%'
   },
});

export const standardRowElementStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%'
   },
});

export const standardCenteredRowElementStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'row', 
      width: '100%',
      justifyContent: 'center',
      padding: '6px 6px',
      alignItems: 'center',
      alignContent: 'center',
      alignSelf: 'center'
   },
});

export const standardJustifiedRowElementStyles = makeStyles({
   root: {
      display: 'flex', 
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      padding: '6px 6px',
      alignItems: 'center',
      alignSelf: 'center'      
   },
});

export const mobileRowElementStyles = makeStyles({
   root: {
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      justifyContent: 'center',
      padding: '6px 6px',
      alignItems: 'center',
      alignSelf: 'center'
   },
});

export const standardTextStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
   },
   heading: {
      textAlign: 'center',
      fontSize: '16pt',
      fontWeight: 'bold',
      color: 'white',   
      marginBottom: '12px'
   },  
   subHeadingLeft: {
      textAlign: 'left',
      alignSelf: 'flex-start',
      fontSize: '12pt',
      fontWeight: 'bold',
      color: 'white', 
      marginTop: '12px',
      marginBottom: '12px'
   },       
   normal: {
      textAlign: 'left',
      alignSelf: 'flex-start',
      fontSize: '10pt',
      color: 'white',  
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
   }
});

export const standardLinkStyles = makeStyles({

   left: {
      textAlign: 'left',
      alignSelf: 'flex-start'
   },
   centred  : {
      textAlign: 'center'
   }
});

