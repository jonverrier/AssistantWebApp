/**
 * Home.tsx
 * 
 * Renders the main landing page component with hero image, title and call-to-action.
 */

/*! Copyright Jon Verrier 2025 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { Text, Image, Button } from '@fluentui/react-components';
import { standardTextStyles } from './CommonStyles';
import { Spacer, Footer, ESpacerSize } from './SiteUtilities';
import { PlainTextParagraphs, PlainTextAlignment } from './PlainTextParagraphs';

export interface HomeProps {
   title: string;
   content: string;
}

export const Home = (props: HomeProps) => {
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const textClasses = standardTextStyles();
   const navigate = useNavigate();

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
               <Text 
                  as="h1" 
                  style={{ 
                     fontSize: '2.5rem', 
                     fontWeight: 'bold',
                     textAlign: 'center' 
                  }}
               >
                  Welcome to Strong AI
               </Text>
               <Spacer size={ESpacerSize.kLarge} />
               <Button 
                  appearance="primary"
                  size="large"
                  style={{ 
                     fontSize: '1.2rem',
                     padding: '16px 32px'
                  }}
                  onClick={() => navigate('/theyard')}
               >
                  The Yard, Peckham ...
               </Button>
               <Spacer size={ESpacerSize.kLarge} />
               <PlainTextParagraphs content={props.content} alignment={PlainTextAlignment.kLeft} />
               <Spacer size={ESpacerSize.kXLarge} />                                        
            </div>
            <Footer />
         </div>
      </div>
   );
}; 