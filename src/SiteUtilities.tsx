/**
 * PageUtilities.tsx
 * 
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */

import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { standardLinkStyles } from './CommonStyles';
import { EAppMode, getUIStrings } from './UIStrings';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { executeReCaptcha } from './captcha';
import { getConfigStrings } from './ConfigStrings';

const MOBILE_BREAKPOINT = 512;

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
    '&::after': {
      content: '""',
      height: 'var(--footer-height)',
    }
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
   const footerRef = useRef<HTMLDivElement>(null);
   const config = getConfigStrings();
   
   const handleLinkClick = async (action: string, path: string) => {
      // Call reCAPTCHA before navigation
      // We throw away the result - we are recording actions as per the Google guidance     
      const captchaResult = await executeReCaptcha(config.captchaApiUrl, action);
            
      window.location.href = path;
   };

   useEffect(() => {
     const updateFooterHeight = () => {
       if (footerRef.current) {
         const height = footerRef.current.offsetHeight;
         document.documentElement.style.setProperty('--footer-height', `${height}px`);
       }
     };

     updateFooterHeight();
     window.addEventListener('resize', updateFooterHeight);
     return () => window.removeEventListener('resize', updateFooterHeight);
   }, []);
   

   return (
      <div ref={footerRef} className={styles.footerContainer}>
         <div className={styles.footerContent}>
            <Link 
               to="/index" 
               className={linkClasses.centred}
               onClick={() => handleLinkClick(config.homeAction, '/index')}
            >{uiStrings.kHome}</Link>         
            <Link 
               to="/privacy" 
               className={linkClasses.centred}
               onClick={() => handleLinkClick(config.privacyAction, '/privacy')}
            >{uiStrings.kPrivacy}</Link>
            <Link 
               to="/terms" 
               className={linkClasses.centred}
               onClick={() => handleLinkClick(config.termsAction, '/terms')}
            >{uiStrings.kTerms}</Link>
         </div>
      </div>
   );
}