/**
 * Test setup configuration that provides a DOM environment for running tests.
 */


// Copyright (c) Jon Verrier, 2025

import { JSDOM } from 'jsdom';
import sinon from 'sinon';
import axios from 'axios';
import { TextEncoder, TextDecoder } from 'util';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="reactRoot"></div></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
  resources: 'usable',
});

// Add Node polyfill
global.Node = dom.window.Node;

// Add EventTarget polyfill
global.EventTarget = dom.window.EventTarget;

// Add Element polyfill
global.Element = dom.window.Element;

// Create a new object with the properties we need
const newGlobal = {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
};

// Add any missing properties that React expects
Object.defineProperty(newGlobal.window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add ResizeObserver to window
Object.defineProperty(newGlobal.window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserver,
});

// Define properties on global
Object.defineProperties(global, {
  window: {
    value: newGlobal.window,
    configurable: true,
  },
  document: {
    value: newGlobal.document,
    configurable: true,
  },
  navigator: {
    value: newGlobal.navigator,
    configurable: true,
  },
  Element: {
    value: dom.window.Element,
    configurable: true,
  }
});

// Create a sandbox that will be used across all tests
const sandbox = sinon.createSandbox();

// Create the axios.post stub before any tests run
const axiosPostStub = sandbox.stub(axios, 'post');

// Export these for use in tests
export { sandbox, axiosPostStub };

// Mock focus events
class MockFocusEvent extends Event {
   private readonly _eventInitDict?: FocusEventInit;

   constructor(type: string, eventInitDict?: FocusEventInit) {
      super(type, eventInitDict);
      this._eventInitDict = eventInitDict;
      Object.setPrototypeOf(this, MockFocusEvent.prototype);
   }

   get target() {
      return this._eventInitDict?.relatedTarget || null;
   }

   get relatedTarget() {
      return null;
   }
}

// Add focus event mocks to global
global.FocusEvent = MockFocusEvent as any;

// Mock focus-related methods
declare global {
   interface Element {
      focus(): void;
      blur(): void;
   }
}

Element.prototype.focus = function(this: Element) {
   const focusEvent = new MockFocusEvent('focus', { bubbles: false, cancelable: false });
   const focusInEvent = new MockFocusEvent('focusin', { bubbles: true, cancelable: false });
   this.dispatchEvent(focusEvent);
   this.dispatchEvent(focusInEvent);
};

Element.prototype.blur = function(this: Element) {
   const blurEvent = new MockFocusEvent('blur', { bubbles: false, cancelable: false });
   const focusOutEvent = new MockFocusEvent('focusout', { bubbles: true, cancelable: false });
   this.dispatchEvent(blurEvent);
   this.dispatchEvent(focusOutEvent);
};
