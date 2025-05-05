/**
 * MultilineEdit.tsx
 * 
 * A reusable component that provides a multiline text input field with dynamic height adjustment.
 * Supports text wrapping calculations and character limit enforcement. Integrates with Fluent UI
 * components for consistent styling and behavior.
 */

/*! Copyright Jon Verrier, 2025 */

// React
import React, { ChangeEvent, useState, useLayoutEffect } from 'react';

// Fluent
import { InputOnChangeData, Textarea, Text, Toolbar, ToolbarButton } from '@fluentui/react-components';
import { SendRegular } from '@fluentui/react-icons';
import { standardTextStyles, standardCenteredRowElementStyles } from './CommonStyles';
import { EMultilineEditUIStrings } from './MultilineEditUIStrings';

export interface IMultilineEditProps {

   caption: string;                    // Display above the edit box
   placeholder: string;                // Display inside the edit box
   maxLength: number;                  // Max number of characters allowed
   message: string;
   fontNameForTextWrapCalculation: string;   // font to use to calculate line flow
   enabled: boolean;
   defaultHeightLines: number;

   onSend(message_: string): void;
   onChange(message_: string): void;
}

export function wrapText(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null,
   text: string,
   width: number,
   defaultHeight: number, defaultWidth: number,
   lineSeparation: number): number {

   let y = 0;
   let hardLines = text.split("\n");

   // Special case if we dont have any text - allow provision for one line
   if (hardLines.length === 0)
      return defaultHeight;

   let dy = 0;
   let lines = 0;

   for (var iHardLines = 0; iHardLines < hardLines.length; iHardLines++) {

      var line = "";
      var words = hardLines[iHardLines].split(" ");
      var lineWidth = 0;
      var lineHeightDelta = defaultHeight;

      for (var iWords = 0; iWords < words.length; iWords++) {
         var testLine = line + words[iWords] + " ";
         var testWidth;

         if (context) {
            let metrics = context.measureText(testLine);
            testWidth = metrics.width;
            lineHeightDelta = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
         }
         else {
            testWidth = defaultWidth * testLine.length;
            lineHeightDelta = defaultHeight;
         }

         // Finish if we have incrementally exceeded maxWidth, 
         // or if we only have one word so we have to finish any way. 
         if ((testWidth > width) || ((testWidth > width) && iWords === 0)) {
            line = words[iWords] + " ";
            y += lineHeightDelta;
            dy += lineHeightDelta;
            lineWidth = (testWidth - lineWidth) - defaultWidth / 2;
            lines++;

            if ((iWords + 1) < words.length)
               dy += lineSeparation;
         }
         else {
            line = testLine;
            lineWidth = testWidth - defaultWidth / 2;
         }
      }

      if (context) {
         let metrics = context.measureText(line);
         testWidth = metrics.width;
         lineHeightDelta = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      }
      else {
         testWidth = defaultWidth * line.length;
         lineHeightDelta = defaultHeight;
      }

      y += lineHeightDelta;
      dy += lineHeightDelta;
      lines++;
      if ((iHardLines + 1) < hardLines.length)
         dy += lineSeparation;
   }

   return dy;
}

// Ref
// https://blog.steveasleep.com/how-to-draw-multi-line-text-on-an-html-canvas-in-2021
export function calculateDyNeeded(width: number, value: string, font: string,
   messagePrompt2HBorder: number, messagePromptLineSpace: number, defaultHeightLines: number): number {

   const smallestTextForWrap = "A";

   let offScreenCanvas = new OffscreenCanvas(width, width * 10);
   if (!offScreenCanvas)
      throw new TypeError("Failed to create offscreen canvas");
   let offscreenContext = offScreenCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
   offscreenContext.font = font;

   let metrics = offscreenContext.measureText(smallestTextForWrap);
   let spaceCharWidth = metrics.width;
   let spaceCharHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

   let dyNeeded = wrapText(offscreenContext, value.length > 0 ? value : smallestTextForWrap,
      width - messagePrompt2HBorder,
      spaceCharHeight,
      spaceCharWidth,
      messagePromptLineSpace);

   let minRows = "A" + "\n".repeat(defaultHeightLines - 1) + "A";
   let dyMin = wrapText(offscreenContext, minRows,
      width,
      spaceCharHeight,
      spaceCharWidth,
      messagePromptLineSpace);

   let tenRows = "A\nA\nA\nA\nA\nA\nA\nA\nA\nA\n";
   let dyMax = wrapText(offscreenContext, tenRows,
      width,
      spaceCharHeight,
      spaceCharWidth,
      messagePromptLineSpace);

   // Tidy up
   offScreenCanvas = null as any as OffscreenCanvas;
   offscreenContext = null as any as OffscreenCanvasRenderingContext2D;

   return Math.max(dyMin, Math.min(dyMax, dyNeeded));
}

export const MultilineEdit = (props: IMultilineEditProps) => {

   const textFieldClasses = standardTextStyles();
   const columnClasses = standardCenteredRowElementStyles();

   const [width, setWidth] = useState(0);
   const textAreaId = "textAreaId;"

   // extract the first number from the font string
   const fontSize = parseInt(props.fontNameForTextWrapCalculation.match(/\d+/)?.[0] || "12");

   const kMessagePrompt2VBorder = fontSize * 2;       // How much to allow for top + bottom inset
   const kMessagePrompt2HBorder = fontSize * 2;       // How much to allow for left & right inset
   const kMessagePromptLineSpace = Math.floor(fontSize * 9 / 16);       // How much to allow between lines      

   // Dynamic function to capture the widthas we need if for calculations to reset hight as the content text grows
   useLayoutEffect(() => {

      const textArea = document.getElementById(
         textAreaId
      ) as HTMLTextAreaElement | null;

      if (textArea) {
         let dx = textArea.offsetWidth;

         if (width !== dx) {
            setWidth(dx);
         }
      }
   }, []);

   function onKeyChange(ev: ChangeEvent<HTMLTextAreaElement>, data: InputOnChangeData): void {

      if (data.value.length <= props.maxLength) {
         props.onChange(data.value);
      }
      else {
         props.onChange(data.value.substring(0, props.maxLength));
      }
   }

   /*
   * looks to see if the user has Ctrl-enter, and if so processes a Commit
   * @param event - Keyboard Event
   * @param value - current text value
   */
   function onSend(event: React.KeyboardEvent<HTMLElement>, value: string) {

      var processed: boolean = false;

      switch (event.key) {

         case 'Enter':
            if (event.ctrlKey) {
               props.onSend(value);
               processed = true;
            }
            break;

         case 'Escape':
            props.onChange("");
            processed = true;
            break;

         default:
            break;
      }

      if (processed) {
         event.stopPropagation();
         event.preventDefault();
      }
   };

   function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      props.onSend(props.message);
   }

   let bump = kMessagePrompt2VBorder;
   var dyNeeded = bump;

   if (width !== 0)
      dyNeeded = calculateDyNeeded(width, props.message, props.fontNameForTextWrapCalculation,
         kMessagePrompt2HBorder, kMessagePromptLineSpace, props.defaultHeightLines) + bump;

   return (<div  style={{width: '100%', maxWidth: '100%'}}>
      <Text className={textFieldClasses.normal} style={{ paddingLeft: '4px', paddingRight: '4px' }}>{props.caption}</Text>
      <Textarea
         id={textAreaId}
         appearance="outline"
         placeholder={props.placeholder}
         maxLength={props.maxLength}
         textarea={{ className: textFieldClasses.textarea, style: { paddingLeft: '4px', paddingRight: '4px' } }}
         resize="none"
         value={props.message}
         onChange={onKeyChange}
         disabled={!props.enabled}
         style={{
            height: (dyNeeded).toString() + 'px',
            width: '100%',
            paddingLeft: '4px',
            paddingRight: '4px'
         }}
         onKeyDown={(e) => onSend(e, props.message)}
         autoFocus={true}
      />
      <div className={columnClasses.root}>
         <Text className={textFieldClasses.centredHint}>{EMultilineEditUIStrings.kMessageTextPrompt}</Text>
         <Toolbar aria-label="Default">
            <ToolbarButton
               aria-label="Send"
               appearance="subtle"
               icon={<SendRegular />}
               onClick={onClick}
               disabled={!props.enabled || props.message.length === 0}
            />
         </Toolbar>
      </div>
   </div>);
}

