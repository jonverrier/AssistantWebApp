/**
 * PlainTextParagraphs.tsx
 * 
 * Component that renders text content split into paragraphs.
 * Handles special formatting for numbered lists and URLs.
 * URLs are automatically converted into clickable links.
 * Numbered items (e.g. "1. Item") are styled as subheadings.
 * Uses common text styles from CommonStyles.
 */

// Copyright (c) Jon Verrier, 2025


import React from 'react';
import { Text, Link as FluentLink } from '@fluentui/react-components';
import { standardTextStyles } from './CommonStyles';
import { Spacer } from './SiteUtilities';

export enum PlainTextAlignment {
    kLeft = 'left',
    kCenter = 'center',
    kRight = 'right'
}

export interface IPlainTextParagraphsProps {
    content: string;
    alignment?: PlainTextAlignment;
}

export const PlainTextParagraphs = (props: IPlainTextParagraphsProps) => {
    const textClasses = standardTextStyles();
    const alignment = props.alignment || PlainTextAlignment.kLeft;

    const getTextStyle = (baseClassName: string) => ({
        className: baseClassName,
        style: { 
            textAlign: alignment,
            width: '100%',
            display: 'block'
        }
    });

    return (
        <div style={{ width: '100%', textAlign: alignment }}>
            {props.content.split('\n').map((line, index) => {
                if (/^\d+\.\s/.test(line)) {
                    return (
                        <React.Fragment key={index}>
                            <Text {...getTextStyle(textClasses.subHeadingLeft)}>{line}</Text>
                            <Spacer />
                        </React.Fragment>
                    );
                }
                if (line.match(/https?:\/\/\S+/)) {
                    const parts = line.split(/(https?:\/\/\S+)/);
                    return (
                        <React.Fragment key={index}>
                            <Text {...getTextStyle(textClasses.normal)}>
                                {parts.map((part, i) => 
                                    part.match(/^https?:\/\//) ? 
                                        <FluentLink key={i} href={part} style={{ textAlign: 'inherit' }}>{part}</FluentLink> : 
                                        part
                                )}
                            </Text>
                            <Spacer />
                        </React.Fragment>
                    );
                }
                return (
                    <React.Fragment key={index}>
                        <Text {...getTextStyle(textClasses.normal)}>{line}</Text>
                        <Spacer />
                    </React.Fragment>
                );
            })}
        </div>
    );
}; 