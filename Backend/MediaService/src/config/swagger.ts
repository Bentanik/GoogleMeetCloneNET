import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { Request } from "express";

function getApiGlobs(): string[] {
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
    return { openapi: "3.0.0", info, paths: {}, servers } as any;
  }
}
