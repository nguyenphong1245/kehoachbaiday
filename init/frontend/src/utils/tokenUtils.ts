/**
 * Kiểm tra JWT token đã hết hạn chưa (client-side).
 * Decode phần payload base64 và so sánh exp claim với thời gian hiện tại.
 * Buffer 30 giây để tránh race condition khi token sắp hết hạn.
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload.exp !== "number") return true;

    const now = Math.floor(Date.now() / 1000);
    const BUFFER_SECONDS = 30;
    return payload.exp - BUFFER_SECONDS <= now;
  } catch {
    return true;
  }
};
