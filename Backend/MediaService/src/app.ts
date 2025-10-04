import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { buildSwaggerSpec } from "@/config/swagger";
import indexRouter from "@/routes";

const app = express();
app.use(bodyParser.json());

const swaggerSpec = buildSwaggerSpec();
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", indexRouter);

export default app;
