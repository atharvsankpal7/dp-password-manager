import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

// One-way hashing for admin passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// PIN hashing
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(
  pin: string,
  hashedPin: string
): Promise<boolean> {
  return bcrypt.compare(pin, hashedPin);
}

// Two-way encryption for client passwords
// Using PIN as part of the encryption key for added security
export function encryptPassword(password: string, pin: string): string {
  const secretKey = process.env.ENCRYPTION_SECRET + pin;
  return CryptoJS.AES.encrypt(password, secretKey).toString();
}

export function decryptPassword(
  encryptedPassword: string,
  pin: string
): string {
  const secretKey = process.env.ENCRYPTION_SECRET + pin;
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}