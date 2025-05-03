/**
 * CopyableText.tsx
 *
 * A reusable component that displays text with a copy-to-clipboard button.
 * Provides a clean interface for displaying and copying text content.
 */
/*! Copyright Jon Verrier 2025 */
import React from 'react';
export interface ICopyableTextProps {
    placeholder: string;
    text: string;
    id: string;
}
export declare const copyableTextStyles: () => Record<"root", string>;
export declare const copyableTextButtonRowStyles: () => Record<"root", string>;
export declare const CopyableText: (props: ICopyableTextProps) => React.JSX.Element;
//# sourceMappingURL=CopyableText.d.ts.map