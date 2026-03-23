import { Platform } from 'react-native';

let _AsyncStorage: any = null;

const getNativeStorage = async () => {
  if (_AsyncStorage) return _AsyncStorage;
  const mod = await import('@react-native-async-storage/async-storage');
  _AsyncStorage = mod.default;
  return _AsyncStorage;
};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try { return window.localStorage.getItem(key); } catch { return null; }
    }
    const AS = await getNativeStorage();
    return AS.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem(key, value); } catch {}
      return;
    }
    const AS = await getNativeStorage();
    return AS.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { window.localStorage.removeItem(key); } catch {}
      return;
    }
    const AS = await getNativeStorage();
    return AS.removeItem(key);
  },
};
