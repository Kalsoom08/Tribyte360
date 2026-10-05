import { randomUUID } from 'crypto';

export function generateCorrelationId(): string {
  return randomUUID();
}

export function generateRequestId(): string {
  return 'req_' + randomUUID().substring(0, 8);
}
