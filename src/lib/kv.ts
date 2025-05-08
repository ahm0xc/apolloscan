import { Redis } from "@upstash/redis";

const PREFIX = "apolloscan_";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error(
    "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set"
  );
}

const redis = new Redis({
  url,
  token,
});

export const kv = {
  get: async (key: string) => {
    return await redis.get(`${PREFIX}${key}`);
  },
  set: async (key: string, value: string) => {
    return await redis.set(`${PREFIX}${key}`, value);
  },
  del: async (key: string) => {
    return await redis.del(`${PREFIX}${key}`);
  },
  increment: async (key: string) => {
    return await redis.incr(`${PREFIX}${key}`);
  },
  keys: async () => {
    return await redis.keys(`${PREFIX}*`);
  },
  scan: async (pattern: string, cursor = 0) => {
    const patternWithPrefix = `${PREFIX}${pattern}`;
    return await redis.scan(cursor, { match: patternWithPrefix });
  },
  getByPattern: async (pattern: string) => {
    try {
      // Get all matching keys with pagination (handle large datasets)
      let cursor = 0;
      let allKeys: string[] = [];

      do {
        const [nextCursor, keys] = await kv.scan(pattern, cursor);
        allKeys = allKeys.concat(keys);
        cursor = parseInt(nextCursor as string);
      } while (cursor !== 0);

      if (allKeys.length === 0) {
        return [];
      }

      // Efficiently fetch values in parallel with proper error handling
      const results = await Promise.all(
        allKeys.map(async (key) => {
          try {
            // Extract the key without prefix for retrieval
            const keyWithoutPrefix = key.replace(PREFIX, "");
            const value = await kv.get(keyWithoutPrefix);

            // Try to parse JSON if the value is a JSON string
            if (typeof value === "string") {
              try {
                return JSON.parse(value);
              } catch {
                // If not valid JSON, return as is
                return value;
              }
            }

            return value;
          } catch (error) {
            console.error(`Error fetching key ${key}:`, error);
            return null;
          }
        })
      );

      // Filter out any null values from failed retrievals
      return results.filter(Boolean);
    } catch (error) {
      console.error("Error in getByPattern:", error);
      return [];
    }
  },
};
