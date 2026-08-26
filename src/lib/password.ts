import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

function looksHashed(stored: string): boolean {
  return stored.startsWith('$2a$') || stored.startsWith('$2b$')
}

export function isHashed(stored: string): boolean {
  return !!stored && looksHashed(stored)
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (!stored) return false
  if (looksHashed(stored)) {
    return bcrypt.compare(plain, stored)
  }
  return plain === stored
}
