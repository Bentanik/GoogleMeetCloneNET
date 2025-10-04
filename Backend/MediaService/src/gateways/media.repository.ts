import { Media } from "@entities/media";

export class MediaRepository {
  private static instance: MediaRepository;
  private items: Media[] = [];

  private constructor() {}

  static getInstance() {
    if (!MediaRepository.instance)
      MediaRepository.instance = new MediaRepository();
    return MediaRepository.instance;
  }

  async save(item: Media) {
    this.items.push(item);
    return item;
  }

  async findAll(): Promise<Media[]> {
    return this.items.slice();
  }
}
