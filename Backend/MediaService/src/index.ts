import "module-alias/register";
import app from "./app";
import { createServer } from "http";
import { log, now } from "@/utils/helper";

const HTTP_PORT = process.env.PORT ? Number(process.env.PORT) : 5002;
const httpServer = createServer(app);

(async () => {
  try {
    httpServer.listen(HTTP_PORT, () => {
      log(`Media server running on port ${HTTP_PORT}`);
      log(`Monitoring: http://localhost:${HTTP_PORT}/api/health`);
      log(`Server start time: ${now()}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
