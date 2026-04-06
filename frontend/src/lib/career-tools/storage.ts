// localStorage utilities for Career Tools

const STORAGE_PREFIX = 'realprofits_career_';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return defaultValue;
}

export function clearStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }
}

export function clearAllCareerStorage(): void {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Failed to clear all career storage:', e);
  }
}

// Auto-save hook
import { useEffect, useRef } from 'react';

export function useAutoSave<T>(key: string, data: T, delay: number = 1000): void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveToStorage(key, data);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay]);
}
