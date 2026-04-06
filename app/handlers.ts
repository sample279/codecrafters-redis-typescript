import {
  storeSet,
  storeGet,
  storeDelete,
  storeAppendLast,
  storeAppendFirst,
  storeGetList,
  storeListLength,
  storePopFirst,
  storeBlockPopFirst,
  storeGetBlocked,
} from "./store";

/**
 * Map of Redis command handlers.
 * Each handler receives command arguments (excluding the command name)
 * and returns a RESP-encoded string.
 *
 * @example
 * handlers["GET"](["mykey"])
 * "$5\r\nhello\r\n"
 */
const handlers: Record<string, (tokens: string[]) => string | Promise<string>> =
  {
    /**
     * Responds with a simple PONG message.
     *
     * @returns RESP simple string
     */
    PING: () => "+PONG\r\n",

    /**
     * Echoes the given message back.
     *
     * @param tokens - [message]
     * @returns RESP bulk string containing the message
     */
    ECHO: (tokens) => `$${tokens[0].length}\r\n${tokens[0]}\r\n`,

    /**
     * Sets a key-value pair in the store.
     * Optionally accepts PX for expiry in milliseconds.
     *
     * @param tokens - [key, value, "PX"?, ttlMs?]
     * @returns RESP simple string "+OK"
     *
     * @example
     * SET mykey myval PX 1000
     */
    SET: (tokens) => {
      const ttlMs =
        tokens[2]?.toUpperCase() === "PX" ? Number(tokens[3]) : undefined;

      storeSet(tokens[0], tokens[1], ttlMs);
      return "+OK\r\n";
    },

    /**
     * Gets the value of a key.
     * Returns a null bulk string if the key does not exist.
     *
     * @param tokens - [key]
     * @returns RESP bulk string or null bulk string
     */
    GET: (tokens) => {
      const value = storeGet(tokens[0]);
      return value !== null ? `$${value.length}\r\n${value}\r\n` : "$-1\r\n";
    },

    /**
     * Pushes one or more values to the tail of a list.
     * Creates the list if it does not exist.
     *
     * @param tokens - [key, ...values]
     * @returns RESP integer representing new list length
     *
     * @example
     * RPUSH mylist a b c
     * ":3\r\n"
     */
    RPUSH: (tokens) => {
      const key: string = tokens[0];
      const value: string[] = tokens.slice(1);

      const push = storeAppendLast(key, value);

      const wait = storeGetBlocked(key);

      if (wait && wait.length > 0) {
        wait.shift()!(value[0]);
      }

      return push;
    },

    /**
     * Pushes one or more values to the head of a list.
     * Creates the list if it does not exist.
     *
     * @param tokens - [key, ...values]
     * @returns RESP integer representing new list length
     *
     * @example
     * LPUSH mylist a b c
     * ":3\r\n"
     */
    LPUSH: (tokens) => {
      const key: string = tokens[0];
      const value: string[] = tokens.slice(1);

      return storeAppendFirst(key, value);
    },

    /**
     * Returns a range of elements from a list.
     * Values between `start` and `stop` (inclusive) are returned.
     * Supports negative indices.
     *
     * @param tokens - [key, start, stop]
     * @returns RESP array of bulk strings
     *
     * @example
     * LRANGE mylist 0 2
     * "*3\r\n$1\r\na\r\n$1\r\nb\r\n$1\r\nc\r\n"
     */
    LRANGE: (tokens) => {
      const key: string = tokens[0];
      const start: number = Number(tokens[1]);
      const stop: number = Number(tokens[2]);

      return storeGetList(key, start, stop);
    },

    /**
     * Returns the length of a list stored at the given key.
     *
     * @param tokens - [key]
     * @returns RESP integer representing list length
     *
     * @example
     * LLEN mylist
     * ":3\r\n"
     */
    LLEN: (tokens) => {
      const key: string = tokens[0];

      return storeListLength(key);
    },

    /**
     * Removes and returns the first element(s) (head) of a list.
     * Returns null bulk string if the list is empty or does not exist.
     *
     * @param tokens - [key, count?]
     * @returns RESP bulk string (single) or array (multiple)
     *
     * @example
     * LPOP mykey
     * "$4\r\nval1\r\n"
     *
     * @example
     * LPOP mykey 2
     * "*2\r\n$4\r\nval1\r\n$4\r\nval2\r\n"
     */
    LPOP: (tokens) => {
      const key: string = tokens[0];
      const count: number = Number(tokens[1]);

      return storePopFirst(key, count);
    },

    BLPOP: async (tokens) => {
      const key = tokens[0];
      const ttBMs = Number(tokens[1]);

      const existing = storeGet(key);

      let element: string;
      if (existing && existing.length > 0) {
        return storePopFirst(key);
      } else {
        element = await storeBlockPopFirst(key, ttBMs);
      }

      return `*2\r\n$${key.length}\r\n${key}\r\n$${element.length}\r\n${element}\r\n`;
    },
  };

export { handlers };
