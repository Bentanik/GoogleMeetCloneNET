import { MediaRepository } from "@gateways/media.repository";
import { Media } from "@entities/media";

export class ListMediaUseCase {
  private repo = MediaRepository.getInstance();

  async execute(): Promise<Media[]> {
    return this.repo.findAll();
  }
}
