/**
 * PageUtilities.tsx
 * 
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */

import React from 'react';
import { Link } from 'react-router-dom';
import { standardLinkStyles } from './CommonStyles';
import { EAppMode, getUIStrings } from './UIStrings';
import { makeStyles, shorthands } from '@fluentui/react-components';

const MOBILE_BREAKPOINT = 768;

const useFooterStyles = makeStyles({
  footerContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--colorNeutralBackground1)',
    ...shorthands.padding('12px'),
    ...shorthands.borderTop('1px', 'solid', 'var(--colorNeutralStroke1)'),
    zIndex: 100,
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    [`@media (max-width: ${MOBILE_BREAKPOINT}px)`]: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    },
  },
});

export interface ISpacerProps {
}

export const Spacer = (props: ISpacerProps) => {
   return (<div>&nbsp;&nbsp;&nbsp;</div>);
}

export interface IFooterProps {
}

export const Footer = (props: IFooterProps) => {
   const uiStrings = getUIStrings(EAppMode.kYardTalk);   
   const linkClasses = standardLinkStyles();
   const styles = useFooterStyles();
   
   return (
      <div className={styles.footerContainer}>
         <div className={styles.footerContent}>
            <Link to="/index" className={linkClasses.centred}>{uiStrings.kHome}</Link>         
            <Link to="/privacy" className={linkClasses.centred}>{uiStrings.kPrivacy}</Link>
            <Link to="/terms" className={linkClasses.centred}>{uiStrings.kTerms}</Link>
         </div>
      </div>);
}