import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { buildSwaggerSpec } from "@config/swagger";
import { Request, Response, NextFunction } from "express";

const app = express();

app.use(bodyParser.json());
app.use(
  "/api/docs",
  swaggerUi.serve,
  (req: Request, res: Response, next: NextFunction) => {
    const spec = buildSwaggerSpec(req);
    return swaggerUi.setup(spec)(req, res, next);
  }
);

app.get("/", (req, res) =>
  res.json({ service: "Media Service", status: "ok" })
);

export default app;
