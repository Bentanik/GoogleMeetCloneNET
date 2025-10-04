import { Request, Response } from "express";
import { CreateMediaUseCase } from "@usecases/createMedia.usecase";
import { ListMediaUseCase } from "@usecases/listMedia.usecase";

export class MediaController {
  private createUseCase = new CreateMediaUseCase();
  private listUseCase = new ListMediaUseCase();

  async list(req: Request, res: Response) {
    const items = await this.listUseCase.execute();
    res.json(items);
  }

  async create(req: Request, res: Response) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const item = await this.createUseCase.execute({ name });
    res.status(201).json(item);
  }
}
