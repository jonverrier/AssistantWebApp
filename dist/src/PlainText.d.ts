/**
 * Plain.tsx
 *
 * Renders a simple page component with a title, content and back link.
 * Used for displaying privacy policy and other static content pages.
 */
/*! Copyright Jon Verrier 2025 */
import React from 'react';
import { ESiteType } from './SiteUtilities';
export interface IPlainTextProps {
    title: string;
    content: string;
    siteType: ESiteType;
}
export declare const PlainText: (props: IPlainTextProps) => React.JSX.Element;
//# sourceMappingURL=PlainText.d.ts.map