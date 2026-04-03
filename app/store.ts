const data = new Map<string, string | string[]>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Sets a key-value pair in the store.
 * If a TTL is provided, the key will expire after the given time.
 *
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
 * Gets value of a key from the store.
 *
 * @param key - The key to get
 * @returns The stored value, or null if the key does not exist
 */
const storeGet = (key: string): string | string[] | null =>
  data.get(key) ?? null;

/**
 * Deletes a key-value pair from the store.
 * Also clears any associated TTL timer.
 *
 * @param key - The key to delete
 */
const storeDelete = (key: string): void => {
  clearTimeout(timers.get(key));
  data.delete(key);
  timers.delete(key);
};

/**
 * Appends one or more values to the end of a list stored at the given key.
 * If the key does not exist, a new list is created.
 * If the key holds a string, it is converted into a list before appending.
 *
 * @param key - The key of the list
 * @param value - Array of values to append
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
 * Appends one or more values to the start of a list stored at the given key.
 * If the key does not exist, a new list is created.
 * If the key holds a string, it is converted into a list before prepending.
 *
 * @param key - The key of the list
 * @param value - Array of values to prepend
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
 * Supports negative indexing.
 *
 * Returns values between `start` and `stop` (inclusive) in RESP format.
 *
 * @param key - The key of the list
 * @param start - Starting index (inclusive)
 * @param stop - Ending index (inclusive)
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

/**
 * Returns the length of a list stored at the given key.
 * If the key does not exist, returns 0.
 *
 * @param key - The key of the list
 * @returns RESP-formatted string containing the list length
 */
const storeListLength = (key: string): string => {
  const existing = storeGet(key);

  if (existing) {
    return `:${existing.length}\r\n`;
  }

  return `:0\r\n`;
};

/**
 * Removes and returns the first element (head) of a list stored at the given key.
 * If the key does not exist or the list is empty, returns a null bulk string.
 *
 * @param key - The key of the list
 * @returns RESP-formatted string containing the popped value
 */
const storePopFirst = (key: string, count?: number): string => {
  const existing = storeGet(key);
  let pop: string | string[] = "";

  if (existing === null || existing.length < 1) {
    return `$-1\r\n`;
  }

  if (Array.isArray(existing)) {
    if (count) {
      pop = existing.splice(0, count);
      return `*${pop.length}\r\n${pop.join("\r\n")}`;
    }
    pop = existing.shift()!;
  }

  return `$${pop?.length}\r\n${pop}\r\n`;
};

export {
  storeSet,
  storeGet,
  storeDelete,
  storeAppendLast,
  storeAppendFirst,
  storeGetList,
  storeListLength,
  storePopFirst,
};
