/**
 * Plain.tsx
 * 
 * Renders a simple page component with a title, content and back link.
 * Used for displaying privacy policy and other static content pages.
 * Utilizes common layout styles from OuterStyles.
 */

/*! Copyright Jon Verrier 2025 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { Text, Image, Button } from '@fluentui/react-components';
import { standardTextStyles } from './CommonStyles';
import { Spacer, Footer } from './SiteUtilities';
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
               <Spacer />
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
               <Spacer />
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
               <Spacer />
               <PlainTextParagraphs content={props.content} alignment={PlainTextAlignment.kCenter} />
               <Spacer />               
            </div>
            <Footer />
         </div>
      </div>
   );
}; 