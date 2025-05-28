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
import { Text, Link as FluentLink, Image } from '@fluentui/react-components';
import { standardTextStyles, standardLinkStyles } from './CommonStyles';
import { Spacer, Footer, Header } from './SiteUtilities';

// The image should be placed in public/assets/img/lifter.png
const lifterIcon = 'assets/img/lifter-w.png';

export interface IPlainTextProps {
   title: string;
   content: string;
}

export const PlainText = (props: IPlainTextProps) => {
   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();
   const textClasses = standardTextStyles();

   // We split the text by newlines and then check if the line starts with a number and a dot.
   // If it does, we treat it as a heading, otherwise we treat it as a normal line of text.
   // If the line starts with a URL, we treat it as a link.
   return (
      <div className={pageOuterClasses.root}>
         <div className={innerColumnClasses.root}>
            <Header title={props.title} />
            <Spacer />            
            {props.content.split('\n').map((line, index) => {
               if (/^\d+\.\s/.test(line)) {
                  return <Text key={index} className={textClasses.subHeadingLeft}>{line}</Text>
               }
               if (line.match(/https?:\/\/\S+/)) {
                  const parts = line.split(/(https?:\/\/\S+)/);
                  return (
                     <Text key={index} className={textClasses.normal}>
                        {parts.map((part, i) => 
                           part.match(/^https?:\/\//) ? 
                              <FluentLink key={i} href={part}>{part}</FluentLink> : 
                              part
                        )}
                     </Text>
                  );
               }
               return <Text key={index} className={textClasses.normal}>{line}</Text>
            })}
            <Spacer/>
            <Footer />
         </div>
      </div>
   );
}; 