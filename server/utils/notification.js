// utils/notification.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * Tạo thông báo cho 1 user
 * @param {Object} param0
 * @param {string} param0.userId - id người nhận thông báo
 * @param {string} param0.type - loại thông báo: 'comment', 'like', 'report'
 * @param {string} param0.content - nội dung thông báo
 * @param {string} [param0.link] - đường dẫn khi bấm vào thông báo
 */
async function createNotification({ userId, type, content, link }) {
  const id = uuidv4();
  await db.query(
    'INSERT INTO notifications (id, userId, type, content, link) VALUES (?, ?, ?, ?, ?)',
    [id, userId, type, content, link || null]
  );
}

module.exports = { createNotification };
