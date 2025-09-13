const { createHmac } = require("crypto");

module.exports.generateRandomNumber = (length) => {
  const characters = "0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

module.exports.generateHOTP = (secret, counter, length = 6) => {
  // Chuyển đổi counter thành Buffer (8 byte)
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / Math.pow(2, 32)), 0); // Phần cao
  counterBuffer.writeUInt32BE(counter & 0xffffffff, 4); // Phần thấp

  // Tạo HMAC-SHA1 với khóa bí mật
  const hmac = createHmac("sha1", secret);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  // Trích xuất mã OTP từ giá trị băm
  const offset = hash[hash.length - 1] & 0xf; // Lấy 4 bit cuối làm offset
  const otp = (hash.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, length); // Lấy 31 bit và mod 10^length

  // Trả về OTP có độ dài yêu cầu
  return otp.toString().padStart(length, "0");
};
