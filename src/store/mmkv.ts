import { StateStorage } from 'zustand/middleware';

let storage: any = {
  set: () => {},
  getString: () => null,
  delete: () => {},
};

try {
  // Catch native missing errors thrown by the Expo Router CLI environment, 
  // ensuring the static route analyzer completes without "missing default export" warnings.
  const { MMKV } = require('react-native-mmkv');
  if (MMKV) {
    storage = new MMKV();
  }
} catch (e) {
  // Silent fallback to mock storage for Node CLI / Web
}

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};
