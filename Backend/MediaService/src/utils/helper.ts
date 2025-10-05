export function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

export function now(): string {
  return new Date().toISOString();
}
