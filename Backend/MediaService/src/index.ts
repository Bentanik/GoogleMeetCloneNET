import fs from "fs";
import https from "https";
import app from "./app";
import { createServer } from "http";
import mediasoupService from "@services/mediasoupService";

const HTTP_PORT = process.env.PORT ? Number(process.env.PORT) : 5002;
const HTTPS_PORT = process.env.HTTPS_PORT
  ? Number(process.env.HTTPS_PORT)
  : 5052;

const httpServer = createServer(app);

(async () => {
  try {
    await mediasoupService.initMediasoup();

    // Attach socket handlers (Socket.IO) to the existing HTTP server
    mediasoupService.attachSocketHandlers(httpServer);

    httpServer.listen(HTTP_PORT, () => {
      console.log(`🚀 Media server running on port ${HTTP_PORT}`);
      console.log(`📊 Monitoring: http://localhost:${HTTP_PORT}/health`);
    });

    // Try to start HTTPS server if certs are available
    const keyPath = process.env.SSL_KEY || "./certs/server.key";
    const certPath = process.env.SSL_CERT || "./certs/server.crt";

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };

      https.createServer(options, app).listen(HTTPS_PORT, () => {
        console.log(`HTTPS server running at https://localhost:${HTTPS_PORT}`);
      });
    } else {
      console.warn(
        `HTTPS certs not found at ${keyPath} and ${certPath}. HTTPS server not started.`
      );
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
