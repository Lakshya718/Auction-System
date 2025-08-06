import { createClient } from "redis";

// Create Redis client with retry options and timeouts
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log(`Redis max reconnect attempts (5) reached, giving up`);
        return new Error("Redis max reconnect attempts reached");
      }
      // Retry with exponential backoff
      const delay = Math.min(Math.pow(2, retries) * 100, 3000);
      console.log(`Redis reconnect attempt ${retries} in ${delay}ms`);
      return delay;
    },
    connectTimeout: 5000, // 5 seconds timeout for connection
  },
});

// Keep track of connection state
let redisConnected = false;

redisClient.on("error", (err) => {
  redisConnected = false;
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis client connected");
  redisConnected = true;
});

redisClient.on("reconnecting", () => {
  console.log("Redis client reconnecting...");
});

redisClient.on("ready", () => {
  console.log("Redis client ready for commands");
  redisConnected = true;
});

redisClient.on("end", () => {
  console.log("Redis client connection closed");
  redisConnected = false;
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      console.log("Attempting to connect to Redis...");
      // Set a timeout for the connection attempt
      const connectionPromise = redisClient.connect();

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Redis connection timeout after 5 seconds"));
        }, 5000);
      });

      // Race the connection against the timeout
      await Promise.race([connectionPromise, timeoutPromise]);

      redisConnected = true;
      console.log("Connected to Redis successfully");
    } else {
      console.log("Redis client already connected");
    }
  } catch (error) {
    redisConnected = false;
    console.error("Failed to connect to Redis:", error.message);
    // Don't throw error to prevent app crash
  }
};

// Function to check if Redis is connected and ready
const isRedisReady = () => {
  return redisConnected && redisClient.isReady;
};

// Safe Redis operations with error handling
const safeRedisOperation = async (operation, fallback = null) => {
  try {
    if (!isRedisReady()) {
      console.warn("Redis not ready, attempting to reconnect...");
      await connectRedis();
      if (!isRedisReady()) {
        console.error("Redis reconnection failed");
        return fallback;
      }
    }
    return await operation();
  } catch (error) {
    console.error("Redis operation failed:", error.message);
    return fallback;
  }
};

export { redisClient, connectRedis, isRedisReady, safeRedisOperation };
