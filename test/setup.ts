/**
 * Test setup configuration that provides a DOM environment for running tests.
 */


// Copyright (c) Jon Verrier, 2025

import { JSDOM } from 'jsdom';
import sinon from 'sinon';
import axios from 'axios';

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
});

// Create a sandbox that will be used across all tests
const sandbox = sinon.createSandbox();

// Create the axios.post stub before any tests run
const axiosPostStub = sandbox.stub(axios, 'post');

// Export these for use in tests
export { sandbox, axiosPostStub };
