import { MediaRepository } from "@gateways/media.repository";
import { Media } from "@entities/media";
import { v4 as uuidv4 } from "uuid";

export class CreateMediaUseCase {
  private repo = MediaRepository.getInstance();

  async execute(input: { name: string }): Promise<Media> {
    const media: Media = {
      id: uuidv4(),
      name: input.name,
      createdAt: new Date(),
    };
    await this.repo.save(media);
    return media;
  }
}
