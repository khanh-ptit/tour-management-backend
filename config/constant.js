module.exports = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(?:\+84|0)(?:\d){9}$/,
  PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{6,}$/,
  OTP_REGEX: /^\d{6}$/,
};
