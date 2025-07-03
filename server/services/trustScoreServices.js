// server/services/trustScoreServices.js

const axios = require("axios");
const whois = require("whois-json");
const https = require("https");
const { URL } = require("url");
require("dotenv").config();

const suspiciousKeywords = ["login", "secure", "verify", "paypal", "bank", "update", "account", "confirm"];

// 🔸 1. Google Safe Browsing
async function checkGoogleSafeBrowsing(url) {
  const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  const body = {
    client: { clientId: "trustcheck", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };

  try {
    const res = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
      body
    );
    return res.data.matches ? -30 : 0;
  } catch (e) {
    console.error("Google Safe Browsing error:", e.message);
    return 0; // không trừ điểm nếu lỗi
  }
}

// 🔸 2. urlscan.io
async function checkUrlScan(url) {
  try {
    const scanRes = await axios.post(
      `https://urlscan.io/api/v1/scan/`,
      {
        url,
        visibility: "public",
      },
      {
        headers: {
          "API-Key": process.env.URLSCAN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return scanRes.data && scanRes.data.message === "Scan submitted" ? -20 : 0;
  } catch (e) {
    console.error("urlscan error:", e.message);
    return 0;
  }
}

// 🔸 3. Tuổi tên miền
async function getDomainAge(urlStr) {
  try {
    const domain = new URL(urlStr).hostname;
    const whoisRes = await whois(domain);
    const created = new Date(whoisRes.creationDate || whoisRes.createdDate);
    const now = new Date();
    const ageMonths = (now - created) / (1000 * 60 * 60 * 24 * 30);
    return ageMonths < 6 ? -15 : 0;
  } catch (e) {
    console.error("WHOIS error:", e.message);
    return 0;
  }
}

// 🔸 4. Tên miền chứa từ khóa đáng ngờ
function hasSuspiciousKeyword(urlStr) {
  const url = urlStr.toLowerCase();
  return suspiciousKeywords.some((kw) => url.includes(kw)) ? -10 : 0;
}

// 🔸 5. Kiểm tra HTTPS
function checkSSL(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "https:" ? 0 : -10;
  } catch (e) {
    return 0;
  }
}

// 🔸 6. Check IP blacklist (placeholder)
async function checkBlacklistIP(urlStr) {
  // ❗ TODO: Gọi AbuseIPDB hoặc Talos API nếu cần
  return 0;
}

// ✅ Tổng hợp điểm
async function calculateTrustScore(url) {
  let score = 100;
  const checks = await Promise.all([
    checkGoogleSafeBrowsing(url),
    checkUrlScan(url),
    getDomainAge(url),
    Promise.resolve(hasSuspiciousKeyword(url)),
    Promise.resolve(checkSSL(url)),
    checkBlacklistIP(url),
  ]);

  const deductions = checks.reduce((sum, cur) => sum + cur, 0);
  score += deductions; // deductions là số âm nên cộng
  return Math.max(0, score);
}

module.exports = {
  calculateTrustScore,
};
