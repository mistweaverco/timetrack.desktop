import { describe, test, expect } from 'vitest'
import {
  getHMSToSeconds,
  getHMSStringFromSeconds,
  getHMSFromSeconds,
  sleep,
} from './Utils';

describe('getHMSToSeconds', () => {
  test('should convert hours, minutes, and seconds to seconds', () => {
    expect(getHMSToSeconds(1, 1, 1)).toBe(3661);
    expect(getHMSToSeconds(0, 0, 0)).toBe(0);
    expect(getHMSToSeconds(0, 0, 1)).toBe(1);
    expect(getHMSToSeconds(0, 1, 0)).toBe(60);
    expect(getHMSToSeconds(1, 0, 0)).toBe(3600);
  });
});

describe('getHMSStringFromSeconds', () => {
  test('should convert seconds to HH:MM:SS format', () => {
    expect(getHMSStringFromSeconds(3661)).toBe('01:01:01');
    expect(getHMSStringFromSeconds(0)).toBe('00:00:00');
    expect(getHMSStringFromSeconds(1)).toBe('00:00:01');
    expect(getHMSStringFromSeconds(60)).toBe('00:01:00');
    expect(getHMSStringFromSeconds(3600)).toBe('01:00:00');
  });
});

describe('getHMSFromSeconds', () => {
  test('should convert seconds to hours, minutes, and seconds', () => {
    expect(getHMSFromSeconds(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
    expect(getHMSFromSeconds(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(getHMSFromSeconds(1)).toEqual({ hours: 0, minutes: 0, seconds: 1 });
    expect(getHMSFromSeconds(60)).toEqual({ hours: 0, minutes: 1, seconds: 0 });
    expect(getHMSFromSeconds(3600)).toEqual({ hours: 1, minutes: 0, seconds: 0 });
  });
});

describe('sleep', () => {
  test('should wait for the specified amount of time', async () => {
    const start = Date.now();
    await sleep(500);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(500);
  });
});
