/**
 * Vendor Grace Period Management
 * 
 * Business Logic:
 * - When vendor signs up, vendorOnboardingCreatedAt is set to NOW
 * - They have 7 days (GRACE_PERIOD_DAYS) to complete onboarding
 * - After 7 days, they are automatically demoted from PENDING vendor to BUYER only
 * - Once demoted, they lose access to onboarding form and become regular buyer
 */

export const GRACE_PERIOD_DAYS = 7;
export const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

/**
 * Check if a pending vendor's grace period has expired
 * @param vendorOnboardingCreatedAt - The timestamp when vendor signup was initiated
 * @returns true if grace period has expired, false otherwise
 */
export function isVendorGracePeriodExpired(vendorOnboardingCreatedAt: Date | null | undefined): boolean {
  if (!vendorOnboardingCreatedAt) {
    return false; // No grace period started
  }

  const now = new Date();
  const elapsedMs = now.getTime() - vendorOnboardingCreatedAt.getTime();
  return elapsedMs > GRACE_PERIOD_MS;
}

/**
 * Calculate remaining days in grace period
 * @param vendorOnboardingCreatedAt - The timestamp when vendor signup was initiated
 * @returns Remaining days (can be 0 or negative if expired)
 */
export function getRemainingGracePeriodDays(vendorOnboardingCreatedAt: Date | null | undefined): number {
  if (!vendorOnboardingCreatedAt) {
    return GRACE_PERIOD_DAYS; // Full period available if just created
  }

  const now = new Date();
  const elapsedMs = now.getTime() - vendorOnboardingCreatedAt.getTime();
  const remainingMs = GRACE_PERIOD_MS - elapsedMs;
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

  return Math.max(0, remainingDays);
}

/**
 * Get human-readable grace period status
 * @param vendorOnboardingCreatedAt - The timestamp when vendor signup was initiated
 * @returns Object with status, remainingDays, and isExpired
 */
export function getGracePeriodStatus(vendorOnboardingCreatedAt: Date | null | undefined) {
  const isExpired = isVendorGracePeriodExpired(vendorOnboardingCreatedAt);
  const remainingDays = getRemainingGracePeriodDays(vendorOnboardingCreatedAt);

  return {
    isExpired,
    remainingDays,
    message: isExpired
      ? `গ্রেস পিরিয়ড শেষ - আপনার ভেন্ডর অ্যাকাউন্ট বন্ধ করা হয়েছে`
      : remainingDays === 1
        ? `আপনার কাছে ১ দিন বাকি আছে অনবোর্ডিং সম্পন্ন করতে`
        : `আপনার কাছে ${remainingDays} দিন বাকি আছে অনবোর্ডিং সম্পন্ন করতে`,
  };
}

  export function isPendingVendorWithinGracePeriod(
    vendorApprovalStatus: string | null | undefined,
    vendorOnboardingCreatedAt: Date | string | null | undefined
  ): boolean {
    if (vendorApprovalStatus !== 'PENDING' || !vendorOnboardingCreatedAt) {
      return false;
    }

    const createdAt = vendorOnboardingCreatedAt instanceof Date
      ? vendorOnboardingCreatedAt
      : new Date(vendorOnboardingCreatedAt);

    if (Number.isNaN(createdAt.getTime())) {
      return false;
    }

    return !isVendorGracePeriodExpired(createdAt);
  }
