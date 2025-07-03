import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient === null) {
    // Create a Redis client
    redisClient = await createClient({
      url: process.env.NODE_ENV === "production"
        ? "redis://interviewai-redis:6379"
        : "redis://localhost:6379",
    })
      .on("error", (err) => console.error("Redis Client Error", err))
      .connect();
  }

  return redisClient;
}
