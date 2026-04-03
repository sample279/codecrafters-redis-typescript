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

/**
 * Appends one or more values to a list stored at the given key.
 * If the key does not exist, a new list is created.
 * If the key holds a string, it is converted into a list before appending.
 *
 * @param key - The key of the list
 * @param value - Array of values to append to the list
 * @returns RESP-formatted string containing the updated list length
 */
const storeAppendLast = (key: string, value: string[]): string => {
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

/**
 * Appends one or more values at the start of the list stored at the given key.
 * If key does not exist, a new list is created.
 * If the key holds a string, it is converted into a list before appending.
 *
 * @param key - The key of the list
 * @param value - Array of values to append to the list
 * @returns RESP-formatted string containing the updated list length
 */
const storeAppendFirst = (key: string, value: string[]): string => {
  let existing = storeGet(key);
  value = value.reverse();

  if (existing === null) {
    const arr = [...value];
    data.set(key, arr);
    return `:${arr.length}\r\n`;
  }

  if (Array.isArray(existing)) {
    existing.unshift(...value);
    return `:${existing.length}\r\n`;
  }

  const arr = [...value, existing];
  data.set(key, arr);
  return `:${arr.length}\r\n`;
};

/**
 * Gets a range of values from a list stored at the given key.
 * Returns values between `start` and `stop` (inclusive) in RESP format.
 *
 * @param key - The key of the list
 * @param start - The starting index (inclusive)
 * @param stop - The ending index (inclusive)
 * @returns RESP-formatted string containing the selected list values
 */
const storeGetList = (key: string, start: number, stop: number): string => {
  const existing = storeGet(key);
  let respArray: string[] = [];

  if (existing) {
    if (start + existing.length < 0) {
      start = 0;
    }

    if (stop + existing.length < 0) {
      stop = 0;
    }

    if (start < 0) {
      start = existing.length + start;
      console.log(start);
    }

    if (stop < 0) {
      stop = existing.length + stop;
    }

    if (stop >= existing.length) {
      stop = existing.length;
    }

    const list = existing.slice(start, stop + 1);

    if (Array.isArray(list)) {
      respArray = list.map((value) => `$${value.length}\r\n${value}`);
    }
  }

  if (existing === null || start >= existing.length || start > stop) {
    return `*0\r\n`;
  }

  return `*${respArray.length}\r\n${respArray.join("\r\n")}\r\n`;
};

const storeListLength = (key: string): string => {
  const existing = storeGet(key);

  if (existing) {
    return `[<+|->]${existing.length}`;
  }

  return `:[<+|->]0\r\n`;
};

export {
  storeSet,
  storeGet,
  storeDelete,
  storeAppendLast,
  storeAppendFirst,
  storeGetList,
  storeListLength,
};
