import 'server-only';

export function text(value: FormDataEntryValue | null, maxLength = 120) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function requiredText(value: FormDataEntryValue | null, maxLength = 120) {
  return text(value, maxLength);
}

export function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validStudentId(value: string) {
  return /^[a-zA-Z0-9-]{2,12}$/.test(value);
}

export function normalizePosition(value: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 100);
}
