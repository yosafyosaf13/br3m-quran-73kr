/**
 * Lightweight password hashing utility using Node.js built-in crypto (scryptSync)
 * Replaces bcryptjs to reduce Turbopack compilation memory usage
 * Compatible with existing bcrypt hashes for verification
 */

import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a password against a hash
 * Supports both scrypt (new) and bcrypt (legacy) formats
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Legacy bcrypt format - starts with $2a$, $2b$, or $2y$
  if (hash.startsWith('$2')) {
    try {
      const bcrypt = await import('bcryptjs');
      return bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  // New scrypt format
  if (hash.startsWith('scrypt:')) {
    const parts = hash.split(':');
    if (parts.length !== 3) return false;

    const [, salt, storedKey] = parts;
    const derivedKey = scryptSync(password, salt, KEY_LENGTH);
    const storedKeyBuffer = Buffer.from(storedKey, 'hex');

    if (derivedKey.length !== storedKeyBuffer.length) return false;

    return timingSafeEqual(derivedKey, storedKeyBuffer);
  }

  return false;
}
