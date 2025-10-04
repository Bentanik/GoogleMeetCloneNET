export function now(): string {
  return new Date().toISOString();
}

export function log(msg: string) {
  console.log(`[Helper] ${now()} ${msg}`);
}
