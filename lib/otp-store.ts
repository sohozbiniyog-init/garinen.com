const globalForOtpStore = globalThis as typeof globalThis & {
  otpStore?: Map<string, string>;
};

export const otpStore = globalForOtpStore.otpStore ?? new Map<string, string>();

if (!globalForOtpStore.otpStore) {
  globalForOtpStore.otpStore = otpStore;
}