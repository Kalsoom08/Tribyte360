import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export function generateCorrelationId(): string {
  return randomUUID();
}

export function generateRequestId(): string {
  return 'req_' + randomUUID().substring(0, 8);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
