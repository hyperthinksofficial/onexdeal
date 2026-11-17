/**
 * PII and secret scrubbing utility for structured logs and Sentry error payloads.
 * Per approved security baseline: never capture passwords, authentication tokens,
 * private messages, email verification tokens, or sensitive precise location data.
 */

const REDACTED_PLACEHOLDER = '[REDACTED]' as const;

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /cookie/i,
  /api[-_]?key/i,
  /^messagebody$/i,
  /^preciselatitude$/i,
  /^preciselongitude$/i,
  /^rawcoordinates$/i,
];

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Deeply clones an object/record while replacing sensitive keys with `"[REDACTED]"`.
 */
export function scrubSensitiveData<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrubSensitiveData(item)) as unknown as T;
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        result[key] = REDACTED_PLACEHOLDER;
      } else {
        result[key] = scrubSensitiveData(entryValue);
      }
    }
    return result as T;
  }

  return value;
}
