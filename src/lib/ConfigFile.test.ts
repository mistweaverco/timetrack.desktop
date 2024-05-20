import { describe, test, expect, vitest } from 'vitest'
import {
  getUserConfig,
  getUserDataPath,
} from './ConfigFile';

vitest.mock('electron', () => ({
  app: {
    getPath: () => '/home/marco/.config/timetrack',
  },
}));

vitest.mock('node:fs/promises', () => ({
  access: async (p: string) => {
    if (p === '/home/marco/.config/timetrack') {
      return Promise.resolve();
    }
    throw new Error('ENOENT');
  },
  mkdir: vitest.fn(),
  readFile: vitest.fn(),
}));

describe('getUserConfig', () => {
  test('should return null, because there is no user config', async () => {
    const config = await getUserConfig();
    expect(config).toEqual(null);
  });
});

describe('getUserDataPath', () => {
  test('should return the user data path', async () => {
    const path = await getUserDataPath();
    expect(path).toBe('/home/marco/.config/timetrack');
  });
});
