import axios from "axios";

const AUTH_TEXT_MAP: Record<string, string> = {
  "incorrect email or password": "Email hoặc mật khẩu không đúng.",
  "please verify your email before logging in. check your inbox for the verification link.": "Vui lòng xác minh email trước khi đăng nhập. Hãy kiểm tra hộp thư để mở liên kết xác minh.",
  "invalid or expired token": "Mã xác thực không hợp lệ hoặc đã hết hạn.",
  "token expired": "Mã xác thực đã hết hạn.",
  "email successfully verified. you can now sign in.": "Xác minh email thành công. Bạn có thể đăng nhập.",
  "if an account exists for that email, a verification message has been sent.": "Nếu email tồn tại trong hệ thống, thư xác minh đã được gửi.",
  "email is already verified.": "Email đã được xác minh.",
  "verification email sent.": "Đã gửi email xác minh.",
  "if an account exists for that email, a reset link has been sent.": "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại đã được gửi.",
  "password reset instructions sent if the account exists.": "Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.",
  "password updated. you can now sign in with your new password.": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
  "unexpected error. please try again.": "Đã có lỗi xảy ra. Vui lòng thử lại.",
};

export const translateAuthText = (message: string): string => {
  const normalized = message.trim().toLowerCase();
  return AUTH_TEXT_MAP[normalized] ?? message;
};

export const parseAuthApiError = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail ?? err.message;
    if (Array.isArray(detail)) {
      return detail.map((item: { msg?: string } | string) => {
        const text = typeof item === "string" ? item : item.msg ?? String(item);
        return translateAuthText(text);
      }).join(", ");
    }
    return translateAuthText(String(detail));
  }

  return fallback;
};
