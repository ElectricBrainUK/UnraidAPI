/**
 * Get the key storage directory. Will use value from environment variables, set
 * to `config` during development via package.json script. Defaults to `secure`
 * when not set for any reason.
 */
export function getKeyStorage(): string {
  const { KeyStorage } = process.env;
  return KeyStorage ?? 'secure';
}
