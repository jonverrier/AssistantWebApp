/**
 * MultilineEdit.tsx
 *
 * A reusable component that provides a multiline text input field with dynamic height adjustment.
 * Supports text wrapping calculations and character limit enforcement. Integrates with Fluent UI
 * components for consistent styling and behavior.
 */
/*! Copyright Jon Verrier, 2025 */
import React from 'react';
export interface IMultilineEditProps {
    caption: string;
    placeholder: string;
    maxLength: number;
    message: string;
    fontNameForTextWrapCalculation: string;
    enabled: boolean;
    defaultHeightLines: number;
    onSend(message_: string): void;
    onChange(message_: string): void;
}
export declare function wrapText(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null, text: string, width: number, defaultHeight: number, defaultWidth: number, lineSeparation: number): number;
export declare function calculateDyNeeded(width: number, value: string, font: string, messagePrompt2HBorder: number, messagePromptLineSpace: number, defaultHeightLines: number): number;
export declare const MultilineEdit: (props: IMultilineEditProps) => React.JSX.Element;
//# sourceMappingURL=MultilineEdit.d.ts.map