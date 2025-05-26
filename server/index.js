const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const db = require('./db');
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const accountRoutes = require('./routes/account');
app.use('/api/accounts', accountRoutes);
const facebookAccountRoutes = require('./routes/facebookAccount');
app.use('/api/facebook', facebookAccountRoutes);

app.use('/api/report-detail', require('./routes/reportDetail'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/report', require('./routes/report'));
app.use('/api/ratings', require('./routes/rating'));
app.use('/api/searchlog', require('./routes/searchLog'));
app.use('/api/comments', require('./routes/comment'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/users', require('./routes/user'));
app.use('/api/admin/comments', require('./routes/adminComment'));
app.use('/api/admin/contacts', require('./routes/adminContact'));
app.use('/api/admin/reports', require('./routes/adminReport'));
app.use('/api/notifications', require('./routes/notification'));
app.use("/api/check-domain", require("./routes/checkDomain"));
const analyzeRoute = require("./routes/analyzeRoute");
app.use("/api", analyzeRoute); // => để POST tới /api/analyze-url

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
