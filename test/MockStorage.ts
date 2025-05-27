/**
 * MockStorage.ts
 * 
 * Provides a mock implementation of IStorage for testing outside the browser environment.
 * Uses a Map to store key-value pairs in memory.
 */
// Copyright (c) Jon Verrier, 2025

import { IStorage } from '../src/LocalStorage';

/**
 * MockStorage class implements IStorage interface for testing.
 * Provides an in-memory storage solution using a Map.
 */
export class MockStorage implements IStorage {
    private storage: Map<string, string>;

    constructor() {
        this.storage = new Map<string, string>();
    }

    /**
     * Get a value from storage by key
     * @param key The key to look up
     * @returns The stored value or undefined if not found
     */
    get(key: string): string | undefined {
        return this.storage.get(key);
    }

    /**
     * Set a value in storage
     * @param key The key to store the value under
     * @param value The value to store
     */
    set(key: string, value: string): void {
        this.storage.set(key, value);
    }

    /**
     * Remove a value from storage
     * @param key The key to remove
     */
    remove(key: string): void {
        this.storage.delete(key);
    }
    
    /**
     * Clear all stored values
     */
    clear(): void {
        this.storage.clear();
    }

    /**
     * Get the number of stored items
     */
    get size(): number {
        return this.storage.size;
    }
} 