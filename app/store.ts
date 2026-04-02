const data = new Map<string, string | string[]>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Sets a key-value pair in the store.
 * @param key - The key to set
 * @param value - The value to store
 * @param ttlMs - Optional expiry in milliseconds
 */
const storeSet = (
  key: string,
  value: string | string[],
  ttlMs?: number,
): void => {
  clearTimeout(timers.get(key));
  data.set(key, value);

  if (ttlMs !== undefined) {
    timers.set(
      key,
      setTimeout(() => storeDelete(key), ttlMs),
    );
  }
};

/**
 * Gets value of key from the store.
 * @param key - The key to get
 */
const storeGet = (key: string): string | string[] | null =>
  data.get(key) ?? null;

/**
 * Deletes the key-value pair in the store
 * @param key - The key to delete
 * */
const storeDelete = (key: string): void => {
  clearTimeout(timers.get(key));
  data.delete(key);
  timers.delete(key);
};

const storeList = (key: string, value: string[]) => {
  let existing = storeGet(key);

  if (existing === null) {
    const arr = [...value];
    data.set(key, arr);
    return `:${arr.length}\r\n`;
  }

  if (Array.isArray(existing)) {
    existing.push(...value);
    return `:${existing.length}\r\n`;
  }

  const arr = [existing, ...value];
  data.set(key, arr);
  return `:${arr.length}\r\n`;
};

export { storeSet, storeGet, storeDelete, storeList };
