import { storeSet, storeGet } from "./store";

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
  ECHO: (tokens) => `$${tokens[1].length}\r\n${tokens[1]}\r\n`,

  /**
   * Sets a key-value pair in the store.
   * Optionally accepts PX for expiry in milliseconds.
   * @example SET mykey myval PX 1000
   */
  SET: (tokens) => {
    const ttlMs =
      tokens[2]?.toUpperCase() === "PX" ? Number(tokens[3]) : undefined;

    storeSet(tokens[0], tokens[1], ttlMs);
    return `+OK\r\n`;
  },

  /**
   * Gets the value of a key.
   * Returns null bulk string if key does not exist.
   */
  GET: (tokens) => {
    const value = storeGet(tokens[0]);
    return value !== null ? `$${value.length}\r\n${value}\r\n` : `$-1\r\n`;
  },

  RPUSH: (tokens) => {
    console.log(tokens);
    const key = tokens[0];
    const value = tokens[1];
    storeSet(key, value);
    return storeGet(key)?.length;
  },
};

export { handlers };
