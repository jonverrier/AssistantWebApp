/**
 * PageUtilities.tsx
 * 
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */

import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { standardLinkStyles, standardTextStyles } from './CommonStyles';
import { getUIStrings } from './UIStrings';
import { makeStyles, shorthands, Text, Image } from '@fluentui/react-components';
import { executeReCaptcha } from './captcha';
import { getConfigStrings } from './ConfigStrings';
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';
import { useUser } from './UserContext';

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

export interface ISpacerProps {
}

export const Spacer = (props: ISpacerProps) => {
   return (<div style={{ height: '12px' }} />);
}

export interface IFooterProps {
}

export const Footer = (props: IFooterProps) => {
   const user = useUser();
   const personality = user?.personality ?? EAssistantPersonality.kDemoAssistant;
   const uiStrings = getUIStrings(personality);
   const linkClasses = standardLinkStyles();
   const styles = useFooterStyles();
   const footerRef = useRef<HTMLDivElement>(null);
   const config = getConfigStrings();
   const textClasses = standardTextStyles();
   const navigate = useNavigate();

   const handleLinkClick = async (action: string, path: string) => {
      // Call reCAPTCHA before navigation
      // We throw away the result - we are recording actions as per the Google guidance     
      const captchaResult = await executeReCaptcha(config.captchaApiUrl, action);
      navigate(path);
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
               to="#"
               className={linkClasses.centred}
               onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(config.homeAction, '/index');
               }}
            >{uiStrings.kHome}</Link>
            <Link
               to="#"
               className={linkClasses.centred}
               onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(config.aboutAction, '/chat');
               }}
            >{uiStrings.kChat}</Link>
            <Link
               to="#"
               className={linkClasses.centred}
               onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(config.privacyAction, '/privacy');
               }}
            >{uiStrings.kPrivacy}</Link>
            <Link
               to="#"
               className={linkClasses.centred}
               onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(config.termsAction, '/terms');
               }}
            >{uiStrings.kTerms}</Link>
         </div>
         <div style={{ textAlign: 'center' }}>
            <Text className={textClasses.footer}>&copy; 2025 Strong AI Technologies Ltd</Text>
         </div>
      </div>
   );
}