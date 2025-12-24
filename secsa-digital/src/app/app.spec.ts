import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('should be defined', () => {
    expect(App).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof App).toBe('function');
  });
});
