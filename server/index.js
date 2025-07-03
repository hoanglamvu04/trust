const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const axios = require('axios');
require('dotenv').config();

const db = require('./db');
const app = express();

// ✅ Cho phép lấy IP thật từ proxy (nếu dùng ngrok, cloudflare, nginx...)
app.set('trust proxy', true);

// ✅ CORS cấu hình để gửi cookie từ localhost:5173
app.use(cors({
  origin: [
    'http://localhost:5173',
    /^chrome-extension:\/\/[a-z]+$/, // Cho phép mọi extension Chrome (dev)
    /^edge-extension:\/\/[a-z]+$/,   // Nếu test trên Edge
    'http://localhost:5000'
  ],
  credentials: true,
}));

// ✅ Middlewares cơ bản
app.use(express.json());
app.use(cookieParser());

// ✅ Thêm express-session
app.use(session({
  secret: 'trustcheck_secret',       // 🔐 Đổi secret nếu cần
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                   // ⚠️ true nếu dùng HTTPS
    httpOnly: true,
    sameSite: 'lax',                 // hoặc 'strict'
  }
}));

// ✅ Phục vụ ảnh chứng cứ từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Định tuyến API
app.use('/api/accounts', require('./routes/account'));
app.use('/api/facebook', require('./routes/facebookAccount'));
app.use('/api/report-detail', require('./routes/reportDetail'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/report', require('./routes/report'));
app.use('/api/ratings', require('./routes/rating'));
app.use('/api/searchlog', require('./routes/searchLog'));
app.use('/api/comment', require('./routes/comment'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/users', require('./routes/user'));
app.use('/api/admin/comment', require('./routes/adminComment'));
app.use('/api/admin/contacts', require('./routes/adminContact'));
app.use('/api/admin/reports', require('./routes/adminReport'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/check-domain', require('./routes/checkDomain'));
app.use('/api', require('./routes/analyzeRoute'));

// ✅ API trung gian gọi urlscan.io

app.post('/api/urlscan', async (req, res) => {
  try {
    const scanRes = await axios.post(
      'https://urlscan.io/api/v1/scan/',
      {
        url: req.body.url,
        visibility: 'public',
      },
      {
        headers: {
          'API-Key': process.env.URLSCAN_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(scanRes.data);
  } catch (error) {
    console.error('🔴 urlscan.io error:', error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data || 'Unknown error from urlscan.io' });
  }
});


// ✅ Phục vụ frontend React (build ra dist/)
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ✅ Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Connected to MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err);
  }

  console.log(`🚀 Server running on port ${PORT}`);
});

const trustScoreService = require('./services/trustScoreServices');

app.post('/api/trust-score', async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Missing domain' });

    const scoreData = await trustScoreService.calculateTrustScore(domain);
    res.json(scoreData);
  } catch (error) {
    console.error("Trust Score Error:", error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});
