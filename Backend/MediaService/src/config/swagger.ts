import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { Request } from "express";

/**
 * Resolve the API globs used by swagger-jsdoc.
 * Priority:
 * - If SWAGGER_APIS env is set (comma-separated globs), use those (resolved)
 * - In production use dist JS globs, otherwise use src TS globs
 */
function getApiGlobs(): string[] {
  const envGlobs = process.env.SWAGGER_APIS;
  if (envGlobs) {
    return envGlobs.split(",").map((g) => path.resolve(g.trim()));
  }

  const isProd = process.env.NODE_ENV === "production";
  if (isProd)
    return [path.resolve(__dirname, "../../dist/interfaces/http/*.js")];
  return [path.resolve(__dirname, "../interfaces/http/*.ts")];
}

const apis = getApiGlobs();

function getDefaultServers() {
  const http = process.env.SWAGGER_HTTP_SERVER || "http://localhost:5002";
  const https = process.env.SWAGGER_HTTPS_SERVER || "https://localhost:5052";
  return [{ url: http }, { url: https }];
}

/**
 * Build a Swagger/OpenAPI spec. If `req` is provided the `servers` entry will
 * reflect the incoming request host/protocol so the UI works behind proxies.
 */
export function buildSwaggerSpec(req?: Request) {
  const servers = req
    ? [{ url: `${req.protocol}://${req.get("host") || "localhost:5002"}` }]
    : getDefaultServers();

  const info = {
    title: "Media Service API",
    version: "1.0.0",
    description:
      "Media service implemented with Clean Architecture and SOLID principles",
  };

  try {
    return swaggerJSDoc({
      definition: {
        openapi: "3.0.0",
        info,
        servers,
      },
      apis,
    });
  } catch (err) {
    console.error("swagger-jsdoc generation error:", err);
    return {
      openapi: "3.0.0",
      info,
      paths: {},
      servers,
    } as any;
  }
}
