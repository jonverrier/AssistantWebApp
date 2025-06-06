/**
 * Home.tsx
 * 
 * Renders the main landing page component with hero image, title and call-to-action.
 */
// Copyright (c) Jon Verrier, 2025

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { LargeTitle, Image, Button } from '@fluentui/react-components';
import { Spacer, Footer, ESpacerSize } from './SiteUtilities';
import { PlainTextParagraphs, PlainTextAlignment } from './PlainTextParagraphs';
import { executeReCaptcha, RECAPTCHA_THRESHOLD } from './captcha';
import { getConfigStrings } from './ConfigStrings';

export interface HomeProps {
   title: string;
   launchButton: boolean;
   content: string | undefined;
}

export const Home = (props: HomeProps) => {
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const navigate = useNavigate();
   const [isButtonDisabled, setIsButtonDisabled] = useState(false);

   useEffect(() => {
      const checkCaptcha = async () => {
         const config = getConfigStrings();
         const result = await executeReCaptcha(config.captchaApiUrl, config.contactAction);
         if (result.score && result.score < RECAPTCHA_THRESHOLD) {
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
               <LargeTitle> 
                  {props.title}
               </LargeTitle>
               <Spacer size={ESpacerSize.kLarge} />
               {props.launchButton && (
                  <>
                     <Button
                        appearance="primary"
                        size="large"
                        style={{
                           fontSize: '1.2rem',
                           padding: '16px 32px'
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
                           padding: '16px 32px'
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
            <Footer />
         </div>
      </div>
   );
}; 