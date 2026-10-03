export function createId(): string {
  const cryptoApi =
    typeof globalThis !== 'undefined' && 'crypto' in globalThis
      ? (globalThis.crypto as Crypto & { randomUUID?: () => string } | undefined)
      : undefined;

  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = (Math.random() * 16) | 0;
    const replacement = character === 'x' ? value : (value & 0x3) | 0x8;
    return replacement.toString(16);
  });
}
