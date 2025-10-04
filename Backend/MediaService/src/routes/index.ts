import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ service: "Media Service", status: "ok" });
});

router.get("/users", (req, res) => {
  res.json([{ id: 1, name: "Vy" }]);
});

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
