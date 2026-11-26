import { createHmac, timingSafeEqual } from 'node:crypto';
import { Request } from 'express';

const TOKEN_DELIMITER = '.';

export function createAccessToken(userId: string, secret: string): string {
  const payload = Buffer
    .from(JSON.stringify({ id: userId }))
    .toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');

  return `${payload}${TOKEN_DELIMITER}${signature}`;
}

export function getUserIdFromToken(token: string, secret: string): string | null {
  const [payload, signature] = token.split(TOKEN_DELIMITER);

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length
    || !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { id?: unknown };

    return typeof data.id === 'string' ? data.id : null;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(req: Request, secret: string): string | null {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return getUserIdFromToken(token, secret);
}
