import { Redis } from "@upstash/redis";

const PREFIX = "youfact_";

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
  keys: async () => {
    return await redis.keys(`${PREFIX}*`);
  },
};
