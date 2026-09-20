/**
 * WhatsApp Helper Utilities for AL JADEED META EGGS
 * Handles normalization, validation, and URL generation for WhatsApp Support & Channels.
 */

/**
 * Normalizes input phone number to the international WhatsApp format (digits only, no + or spaces).
 * Handles common Pakistani phone number formats:
 * - 03001234567 -> 923001234567
 * - +923001234567 -> 923001234567
 * - 00923001234567 -> 923001234567
 * - 0300 8476546 -> 923008476546
 * - 3001234567 -> 923001234567
 */
export function normalizeWhatsAppNumber(rawNumber: string): string {
  if (!rawNumber) return '';

  // Remove any non-alphanumeric/non-plus characters (spaces, dashes, parentheses, dots)
  let cleaned = rawNumber.trim().replace(/[\s\-\(\)\.]/g, '');

  // Strip leading + or 00
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // Only keep digits
  cleaned = cleaned.replace(/\D/g, '');

  // Pakistani standard normalization:
  // E.g. "03001234567" (11 digits starting with 03) -> "923001234567"
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    // E.g. "3001234567" -> "923001234567"
    cleaned = '92' + cleaned;
  }

  return cleaned;
}

/**
 * Validates if the normalized WhatsApp number is plausible (10 to 15 digits).
 */
export function isValidWhatsAppNumber(number: string): boolean {
  const normalized = normalizeWhatsAppNumber(number);
  return /^\d{10,15}$/.test(normalized);
}

/**
 * Validates if the provided WhatsApp Channel URL is valid.
 * Requires http:// or https:// and a non-empty domain path.
 */
export function isValidWhatsAppChannelUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Builds the official WhatsApp direct click-to-chat URL.
 * Supports prefilled messages encoded with encodeURIComponent.
 */
export function buildWhatsAppSupportUrl(number: string, welcomeMessage?: string): string {
  const normalized = normalizeWhatsAppNumber(number);
  if (!normalized) return '';

  const baseUrl = `https://wa.me/${normalized}`;
  if (welcomeMessage && welcomeMessage.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(welcomeMessage.trim())}`;
  }
  return baseUrl;
}

/**
 * Prettifies a phone number for user-facing UI presentation.
 * E.g., "923008476546" -> "+92 300 8476546"
 * or "03008476546" -> "0300 8476546"
 */
export function formatDisplayWhatsAppNumber(rawNumber: string): string {
  if (!rawNumber) return '';
  const normalized = normalizeWhatsAppNumber(rawNumber);

  // If 923XXXXXXXXX (12 digits, Pakistan)
  if (normalized.startsWith('923') && normalized.length === 12) {
    const prefix = normalized.substring(2, 5); // "300"
    const rest = normalized.substring(5);      // "8476546"
    return `+92 ${prefix} ${rest}`;
  }

  // If 11 digits starting with 03
  const digitsOnly = rawNumber.replace(/\D/g, '');
  if (digitsOnly.startsWith('03') && digitsOnly.length === 11) {
    return `${digitsOnly.substring(0, 4)} ${digitsOnly.substring(4)}`;
  }

  return rawNumber.trim();
}
