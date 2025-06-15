/**
 * Home.tsx
 * 
 * Renders the main landing page component with hero image, title and call-to-action.
 */
// Copyright (c) Jon Verrier, 2025

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { LargeTitle, Image, Button, Text } from '@fluentui/react-components';
import { Spacer, Footer, ESpacerSize, ESiteType } from './SiteUtilities';
import { PlainTextParagraphs, PlainTextAlignment } from './PlainTextParagraphs';
import { executeReCaptcha, RECAPTCHA_THRESHOLD } from './captcha';
import { getConfigStrings } from './ConfigStrings';
import { standardTextStyles } from './CommonStyles';
import { isAppInLocalhost } from './LocalStorage';

export interface HomeProps {
   title: string;
   strapline: string;
   contactButton: boolean;
   gymLaunch: boolean;
   content: string | undefined;
}

export const Home = (props: HomeProps) => {
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const textClasses = standardTextStyles(); 
   
   const navigate = useNavigate();
   const [isButtonDisabled, setIsButtonDisabled] = useState(false);
   const [error, setError] = useState<string | undefined>();

   useEffect(() => {
      const checkCaptcha = async () => {
         try {
            // Skip reCAPTCHA check in localhost
            if (isAppInLocalhost()) {
               return;
            }

            // Check if reCAPTCHA script is loaded
            if (!window.grecaptcha) {
               console.error('reCAPTCHA script not loaded');
               setError('Security check failed to load');
               setIsButtonDisabled(true);
               return;
            }

            // Wait for reCAPTCHA to be ready
            await new Promise<void>((resolve) => {
               window.grecaptcha.ready(() => resolve());
            });

            const config = getConfigStrings();
            const result = await executeReCaptcha(config.captchaApiUrl, config.contactAction);
            
            if (!result.success || (result.score && result.score < RECAPTCHA_THRESHOLD)) {
               setIsButtonDisabled(true);
               setError('Security check failed');
            }
         } catch (error) {
            console.error('Error during reCAPTCHA check:', error);
            setError('Security check failed');
            setIsButtonDisabled(true);
         }
      };

      checkCaptcha();
   }, []);

   return (
      <div className={pageOuterClasses.root}>
         <div className={innerColumnClasses.root}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
               <Image 
                  src="assets/img/hero.jpg"
                  style={{ width: '100%', height: 'auto', maxHeight: '512px', objectFit: 'cover' }}
                  alt="Strong AI Bold Image"
               />
               <Spacer size={ESpacerSize.kLarge} />
               <LargeTitle style={{ textAlign: 'center', width: '100%' }}> 
                  {props.title}
               </LargeTitle>
               <Text className={textClasses.centredHintLarge}>{props.strapline}</Text>
               {error && (
                  <>
                     <Spacer />
                     <Text style={{ color: 'red' }}>{error}</Text>
                  </>
               )}
               <Spacer size={ESpacerSize.kLarge} />
               {props.gymLaunch && (
                  <>
                     <Button
                        appearance="primary"
                        size="large"
                        style={{
                           fontSize: '1.2rem',
                           padding: '16px 32px',
                           width: '200px'
                        }}
                        onClick={() => navigate('/theyard')}
                        disabled={isButtonDisabled}                        
                     >
                        The Yard...
                     </Button>
                     <Spacer size={ESpacerSize.kLarge} />
                     <Button
                        appearance="primary"
                        size="large"
                        style={{
                           fontSize: '1.2rem',
                           padding: '16px 32px',
                           width: '200px'
                        }}
                        onClick={() => navigate('/crank')}
                        disabled={isButtonDisabled}                        
                     >
                        Crank...
                     </Button>
                     <Spacer size={ESpacerSize.kLarge} />                     
                  </>
               )}
               {props.content && (
                  <>
                     <PlainTextParagraphs content={props.content} alignment={PlainTextAlignment.kLeft} /> 
                     <Spacer size={ESpacerSize.kLarge} />                   
                  </>
               )}
               {props.contactButton && (
                  <>                     
                     <Button
                        appearance="primary"
                        size="large"
                        style={{
                           fontSize: '1.2rem',
                           padding: '16px 32px'
                        }}
                        onClick={() => window.open('mailto:infostrongai@gmail.com', '_blank')}
                        disabled={isButtonDisabled}
                     >
                        Contact us ...
                     </Button>
                     <Spacer size={ESpacerSize.kLarge} />                     
                  </>
               )}
            </div>
            <Footer siteType={ESiteType.kMain} />
         </div>
      </div>
   );
}; 