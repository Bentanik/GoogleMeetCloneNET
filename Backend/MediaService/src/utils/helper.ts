export function log(msg: string) {
  console.log(`[Helper] ${msg}`);
}

export function now(): string {
  return new Date().toISOString();
}
