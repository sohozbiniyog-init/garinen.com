const BANGLADESH_MOBILE_PATTERN = /^(?:\+?8801[3-9]\d{8}|01[3-9]\d{8})$/;

export function normalizeBangladeshPhone(input: string): string | null {
  const cleaned = input.trim().replace(/[\s()-]/g, '');

  if (!cleaned) {
    return null;
  }

  if (!BANGLADESH_MOBILE_PATTERN.test(cleaned)) {
    return null;
  }

  if (cleaned.startsWith('+880')) {
    return cleaned;
  }

  if (cleaned.startsWith('880')) {
    return `+${cleaned}`;
  }

  if (cleaned.startsWith('01')) {
    return `+88${cleaned}`;
  }

  return null;
}