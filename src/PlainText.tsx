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
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { standardTextStyles } from './CommonStyles';
import { Spacer, Footer, Header } from './SiteUtilities';
import { PlainTextParagraphs } from './PlainTextParagraphs';

export interface IPlainTextProps {
   title: string;
   content: string;
}

export const PlainText = (props: IPlainTextProps) => {
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const textClasses = standardTextStyles();

   return (
      <div className={pageOuterClasses.root}>
         <div className={innerColumnClasses.root}>
            <Header title={props.title} />
            <Spacer />    
            <Spacer />        
            <PlainTextParagraphs content={props.content} />
            <Spacer/>
            <Footer />
         </div>
      </div>
   );
}; 