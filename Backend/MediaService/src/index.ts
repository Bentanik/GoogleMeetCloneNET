import "dotenv/config";
import "module-alias/register";
import httpServer from "@/app";
import { initMediasoup } from "@/mediasoup/worker";
import { log, now } from "@/utils/helper";

const HTTP_PORT = process.env.PORT ? Number(process.env.PORT) : 5002;

(async () => {
  try {
    await initMediasoup();
    httpServer.listen(HTTP_PORT, () => {
      log(`Media server running on port ${HTTP_PORT}`);
      log(`Server start time: ${now()}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
