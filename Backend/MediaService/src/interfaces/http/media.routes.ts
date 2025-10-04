import { Router } from "express";
import { MediaController } from "@interfaces/http/media.controller";

const router = Router();
const controller = new MediaController();

// Swagger tags
/**
 * @openapi
 * tags:
 *   - name: Media
 *     description: Media operations
 */

/**
 * @openapi
 * /api/media:
 *   get:
 *     summary: List media items
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", controller.list.bind(controller));

/**
 * @openapi
 * /api/media:
 *   post:
 *     summary: Create a media item
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", controller.create.bind(controller));

export default router;
