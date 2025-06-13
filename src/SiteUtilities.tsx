/**
 * PageUtilities.tsx
 * 
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */

import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { standardLinkStyles, standardTextStyles } from './CommonStyles';
import { getCommonUIStrings } from './UIStrings';
import { makeStyles, shorthands, Text, Image } from '@fluentui/react-components';
import { executeReCaptcha } from './captcha';
import { getConfigStrings } from './ConfigStrings';
import { useUser } from './UserContext';

const MOBILE_BREAKPOINT = 512;

const useFooterStyles = makeStyles({
   footerContainer: {
      backgroundColor: 'var(--colorNeutralBackground1)',
      ...shorthands.padding('12px'),
      ...shorthands.borderTop('1px', 'solid', 'var(--colorNeutralStroke1)'),
      width: '100%',
      marginTop: 'auto'
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
   disabledLink: {
      opacity: 0.5,
      pointerEvents: 'none',
      cursor: 'not-allowed'
   }
});

export interface IHeaderProps {
   title: string;
}

export const Header: React.FC<IHeaderProps> = ({ title }) => {
   const textClasses = standardTextStyles();
   const lifterIcon = 'assets/img/lifter-w.png';

   return (
      <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
         <Image
            src={lifterIcon}
            alt="Menu Icon"
            style={{
               width: '32px',
               height: '32px',
               cursor: 'pointer',
               position: 'absolute',
               left: 0,
               top: '50%',
               transform: 'translateY(-50%)'
            }}
         />
         <div style={{ display: 'inline-block' }}>
            <Text className={textClasses.heading}>{title}</Text>
         </div>
      </div>
   );
};

export enum ESpacerSize {
   kSmall = 8,
   kMedium = 14,
   kLarge = 20,
   kXLarge = 32
}

export interface ISpacerProps {
   size?: ESpacerSize;
}

export const Spacer = (props: ISpacerProps) => {
   const size = props.size ?? ESpacerSize.kMedium;
   return (<div style={{ height: `${size}px` }} />);
}

export enum ESiteType {
   kMain = 'main',
   kPrivacy = 'privacy',
   kTerms = 'terms'
}

export interface IFooterProps {
   siteType: ESiteType;
}

export const Footer = (props: IFooterProps) => {
   const user = useUser();
   const personality = user?.personality;
   const uiStrings = getCommonUIStrings();
   const linkClasses = standardLinkStyles();
   const styles = useFooterStyles();
   const footerRef = useRef<HTMLDivElement>(null);
   const config = getConfigStrings();
   const textClasses = standardTextStyles();
   const navigate = useNavigate();

   // Determine if we're on a standalone site (privacy or terms)
   const standaloneSite = props.siteType === ESiteType.kPrivacy || props.siteType === ESiteType.kTerms;

   const handleLinkClick = async (action: string, path: string) => {
      // Call reCAPTCHA before navigation
      // We throw away the result - we are recording actions as per the Google guidance     
      const captchaResult = await executeReCaptcha(config.captchaApiUrl, action);
      navigate(path);
   };

   const handleHardLinkClick = async (action: string, path: string) => {
      // Call reCAPTCHA before navigation
      // We throw away the result - we are recording actions as per the Google guidance     
      const captchaResult = await executeReCaptcha(config.captchaApiUrl, action);
      // Use window.location for hard navigation
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
               to="/"
               className={linkClasses.centred}
               onClick={(e) => {
                  e.preventDefault();
                  if (standaloneSite) {
                     handleHardLinkClick(config.homeAction, '/');
                  } else {
                     handleLinkClick(config.homeAction, '/');
                  }
               }}
            >{uiStrings.kHome}</Link>
            <Link
               to="/chat"
               className={`${linkClasses.centred} ${!personality ? styles.disabledLink : ''}`}
               onClick={(e) => {
                  e.preventDefault();
                  if (personality) {
                     if (standaloneSite) {
                        handleHardLinkClick(config.chatAction, '/chat.html');
                     } else {
                        handleLinkClick(config.chatAction, '/chat');
                     }
                  }
               }}
            >{uiStrings.kChat}</Link>            
            <Link
               to="/privacy"
               className={linkClasses.centred}
               onClick={(e) => {
                  e.preventDefault();
                  if (props.siteType === ESiteType.kPrivacy) {
                     // Already on privacy page, do nothing
                     return;
                  }
                  handleHardLinkClick(config.privacyAction, '/privacy.html');
               }}
            >{uiStrings.kPrivacy}</Link>
            <Link
               to="/terms"
               className={linkClasses.centred}
               onClick={(e) => {
                  e.preventDefault();
                  if (props.siteType === ESiteType.kTerms) {
                     // Already on terms page, do nothing
                     return;
                  }
                  handleHardLinkClick(config.termsAction, '/terms.html');
               }}
            >{uiStrings.kTerms}</Link>
            <Link
               to="/about"
               className={linkClasses.centred}
               onClick={(e) => {
                  e.preventDefault();
                  if (standaloneSite) {
                     handleHardLinkClick(config.aboutAction, '/about.html');
                  } else {
                     handleLinkClick(config.aboutAction, '/about');
                  }
               }}
            >{uiStrings.kAbout}</Link>            
         </div>
         <div style={{ textAlign: 'center' }}>
            <Text className={textClasses.footer}>&copy; 2025 Strong AI Technologies Ltd</Text>
         </div>
      </div>
   );
}