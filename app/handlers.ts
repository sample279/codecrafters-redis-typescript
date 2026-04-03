import {
  storeSet,
  storeGet,
  storeDelete,
  storeAppendLast,
  storeAppendFirst,
  storeGetList,
  storeListLength,
} from "./store";

/**
 * Map of Redis command handlers.
 * Each handler receives the command arguments (without the command name itself)
 * and returns a RESP-encoded string.
 * @example
 * handlers["GET"](["mykey"]) // "$5\r\nhello\r\n"
 */
const handlers: Record<string, (tokens: string[]) => string> = {
  /** Responds with PONG */
  PING: () => "+PONG\r\n",

  /** Echoes the given message back */
  ECHO: (tokens) => `$${tokens[0].length}\r\n${tokens[0]}\r\n`,

  /**
   * Sets a key-value pair in the store.
   * Optionally accepts PX for expiry in milliseconds.
   * @example SET mykey myval PX 1000
   */
  SET: (tokens) => {
    const ttlMs =
      tokens[2]?.toUpperCase() === "PX" ? Number(tokens[3]) : undefined;

    storeSet(tokens[0], tokens[1], ttlMs);
    return "+OK\r\n";
  },

  /**
   * Gets the value of a key.
   * Returns null bulk string if key does not exist.
   */
  GET: (tokens) => {
    const value = storeGet(tokens[0]);
    return value !== null ? `$${value.length}\r\n${value}\r\n` : "$-1\r\n";
  },

  /**
   * Pushes one or more values to the tail of a list.
   * Creates the list if it does not exist.
   * Returns the new length of the list.
   * @example
   * // RPUSH mylist a b c
   * // ":3\r\n"
   */
  RPUSH: (tokens) => {
    const key: string = tokens[0];
    const value: string[] = tokens.slice(1);

    return storeAppendLast(key, value);
  },

  /**
   * Pushes one or more values to the head of a list.
   * Creates the list if it does not exist.
   * Returns the new length of the list.
   * @example
   * // LPUSH mylist a b c
   * // ":3\r\n"
   */

  LPUSH: (tokens) => {
    const key: string = tokens[0];
    const value: string[] = tokens.slice(1);

    return storeAppendFirst(key, value);
  },

  /**
   * Returns a range of elements from a list.
   * Values between `start` and `stop` (inclusive) are returned in RESP format.
   * Supports negative indices.
   * @param tokens - [key, start, stop]
   * @example
   * // LRANGE mylist 0 2
   * // "*3\r\n$1\r\na\r\n$1\r\nb\r\n$1\r\nc\r\n"
   */
  LRANGE: (tokens) => {
    const key: string = tokens[0];
    const start: number = Number(tokens[1]);
    const stop: number = Number(tokens[2]);

    return storeGetList(key, start, stop);
  },

  LLEN: (tokens) => {
    const key: string = tokens[0];

    return storeListLength(key);
  },
};

export { handlers };
