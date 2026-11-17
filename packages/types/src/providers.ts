/**
 * Architectural adapter interfaces for external providers.
 * Per Phase 0 baseline: keeps business logic decoupled from Cloudflare R2/S3,
 * transactional email vendors, Expo Push/FCM/APNs, and search engines.
 */

export interface SignedUploadIntentInput {
  objectKey: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  contentLengthBytes: number;
  expiresInSeconds?: number;
}

export interface SignedUploadIntentResult {
  uploadUrl: string;
  objectKey: string;
  expiresAtIso: string;
}

/**
 * Object storage abstraction (Cloudflare R2 default, portable to AWS S3 Mumbai).
 */
export interface StorageProvider {
  readonly providerName: string;
  createSignedUploadUrl(input: SignedUploadIntentInput): Promise<SignedUploadIntentResult>;
  getPublicUrl(objectKey: string): string;
  deleteObject(objectKey: string): Promise<void>;
}

export interface TransactionalEmailMessage {
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  category: 'email_verification' | 'password_reset' | 'account_notification';
}

export interface SendEmailResult {
  messageId: string;
  accepted: boolean;
}

/**
 * Transactional email abstraction (Mailpit in local dev; configurable provider in production).
 */
export interface EmailProvider {
  readonly providerName: string;
  sendTransactionalEmail(message: TransactionalEmailMessage): Promise<SendEmailResult>;
}

export interface PushNotificationPayload {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushSendResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

/**
 * Push notification abstraction (Expo Push Service default, portable to direct FCM/APNs).
 */
export interface PushProvider {
  readonly providerName: string;
  sendPushNotifications(payload: PushNotificationPayload): Promise<PushSendResult>;
}
