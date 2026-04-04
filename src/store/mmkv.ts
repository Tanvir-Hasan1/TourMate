import { StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

let storage: StateStorage = {
  setItem: async (name: string, value: string) => {
    return await AsyncStorage.setItem(name, value);
  },
  getItem: async (name: string) => {
    const value = await AsyncStorage.getItem(name);
    return value ?? null;
  },
  removeItem: async (name: string) => {
    return await AsyncStorage.removeItem(name);
  },
};

try {
  if (Platform.OS !== 'web') {
    // Catch native missing errors thrown by the Expo Router CLI environment, 
    // ensuring the static route analyzer completes without "missing default export" warnings.
    const { MMKV } = require('react-native-mmkv');
    if (MMKV) {
      const mmkv = new MMKV();
      storage = {
        setItem: (name, value) => {
          mmkv.set(name, value);
        },
        getItem: (name) => {
          const value = mmkv.getString(name);
          return value ?? null;
        },
        removeItem: (name) => {
          mmkv.delete(name);
        },
      };
    }
  }
} catch (e) {
  // Silent fallback to AsyncStorage for Expo Go / Web
}

export const zustandStorage: StateStorage = storage;
