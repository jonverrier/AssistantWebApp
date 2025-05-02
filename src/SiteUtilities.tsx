/**
 * PageUtilities.tsx
 * 
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */

import React from 'react';
import { Link } from 'react-router-dom';
import { mobileRowElementStyles, standardJustifiedRowElementStyles, standardLinkStyles } from './CommonStyles';
import { EAppMode, getUIStrings, IUIStrings } from './UIStrings';

const MOBILE_BREAKPOINT = 768;

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

   const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
   
   const containerStyle = isMobile ? 
      mobileRowElementStyles().root : 
      standardJustifiedRowElementStyles().root;

   return (
      <div className={containerStyle}>
         <Link to="/index" className={linkClasses.centred}>{uiStrings.kHome}</Link>         
         <Link to="/privacy" className={linkClasses.centred}>{uiStrings.kPrivacy}</Link>
         <Link to="/terms" className={linkClasses.centred}>{uiStrings.kTerms}</Link>
      </div>);
}