/**
 * Plain.tsx
 * 
 * Renders a simple page component with a title, content and back link.
 * Used for displaying privacy policy and other static content pages.
 */

/*! Copyright Jon Verrier 2025 */

// Copyright (c) Jon Verrier, 2025

import React from 'react';
import { pageOuterStyles, innerColumnStyles } from './OuterStyles';
import { Spacer, Footer, Header, ESpacerSize } from './SiteUtilities';
import { PlainTextParagraphs } from './PlainTextParagraphs';

export interface IPlainTextProps {
   title: string;
   content: string;
}

export const PlainText = (props: IPlainTextProps) => {
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();

   return (
      <div className={pageOuterClasses.root}>
         <div className={innerColumnClasses.root}>
            <Header title={props.title} />
            <Spacer size={ESpacerSize.kLarge} />         
            <PlainTextParagraphs content={props.content} />
            <Spacer size={ESpacerSize.kXLarge} />              
            <Footer />
         </div>
      </div>
   );
}; 