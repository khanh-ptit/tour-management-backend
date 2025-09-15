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

module.exports.generateTOTP = (secret, timeStep = 30, length = 6) => {
  // Lấy thời gian hiện tại tính từ Unix Epoch và chia cho thời gian mỗi chu kỳ (timeStep)
  const timeCounter = Math.floor(Date.now() / 1000 / timeStep); // Đảm bảo chu kỳ 30 giây

  // Chuyển đổi thời gian thành Buffer (8 byte)
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(Math.floor(timeCounter / Math.pow(2, 32)), 0); // Phần cao
  timeBuffer.writeUInt32BE(timeCounter & 0xffffffff, 4); // Phần thấp

  // Tạo HMAC-SHA1 với khóa bí mật
  const hmac = createHmac("sha1", secret);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  // Trích xuất mã OTP từ giá trị băm
  const offset = hash[hash.length - 1] & 0xf; // Lấy 4 bit cuối làm offset
  const otp = (hash.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, length); // Lấy 31 bit và mod 10^length

  // Trả về OTP có độ dài yêu cầu
  return otp.toString().padStart(length, "0");
};
