import "dotenv/config";
import "module-alias/register";
import app from "./app";
import { createServer } from "http";
import { initMediasoup } from "@/mediasoup/mediasoupHandler";
import { initSocket } from "@/ioHandler";
import { log, now } from "@/utils/helper";
import Redis from "ioredis";

const HTTP_PORT = process.env.PORT ? Number(process.env.PORT) : 5002;
const httpServer = createServer(app);

// (async () => {
//   try {
//     await initMediasoup();
//     initSocket(httpServer);

//     httpServer.listen(HTTP_PORT, () => {
//       log(`Media server running on port ${HTTP_PORT}`);
//       log(`Server start time: ${now()}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// })();

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.set("vietvy", "depzai");
