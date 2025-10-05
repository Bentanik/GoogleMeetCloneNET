import Redis from "ioredis";

export class RedisHelper {
  private readonly redis: Redis;

  constructor(host: string, port = 6379, username?: string, password?: string) {
    this.redis = new Redis({
      host,
      port,
      username,
      password,
    });
  }

  async getRoomJson(roomCode: string): Promise<string | null> {
    return await this.redis.get(`room:${roomCode}`);
  }

  async getParticipantCount(roomCode: string): Promise<number> {
    const countStr = await this.redis.get(`room:${roomCode}:participants`);
    return parseInt(countStr || "0", 10);
  }

  async incrementParticipantCount(roomCode: string): Promise<number> {
    return await this.redis.incr(`room:${roomCode}:participants`);
  }

  async decrementParticipantCount(roomCode: string): Promise<number> {
    const count = await this.redis.decr(`room:${roomCode}:participants`);
    if (count < 0) await this.redis.set(`room:${roomCode}:participants`, "0");
    return Math.max(0, count);
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
