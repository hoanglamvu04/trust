module.exports = function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Lấy IP đầu tiên trong danh sách forwarded
    return forwarded.split(',')[0].trim();
  }

  const raw = req.connection?.remoteAddress || req.socket?.remoteAddress || '';
  
  // Loại bỏ ::ffff: nếu có (IPv4 mapped IPv6)
  return raw.replace(/^.*:/, '');
};
