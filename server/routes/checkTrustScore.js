// server/routes/checkTrustScore.js
const express = require('express');
const router = express.Router();
const {
  checkGoogleSafeBrowsing,
  checkUrlScan,
  getDomainAge,
  hasSuspiciousKeyword,
  checkSSL,
  checkBlacklistIP
} = require('../services/trustScoreServices');

// Tính điểm tổng
function calculateTrustScore(results) {
  let score = 100;

  if (results.safeBrowsing.isSafe === false) score -= 30;
  if (results.urlscan.threatDetected) score -= 20;
  if (results.domainAgeInDays < 180) score -= 15;
  if (results.hasSuspiciousKeyword) score -= 10;
  if (!results.usesHttps) score -= 10;
  if (results.ipInBlacklist) score -= 5;

  return Math.max(score, 0);
}

router.post('/trust-score', async (req, res) => {
  const { url } = req.body;

  try {
    const [safeBrowsing, urlscan, domainAge, suspicious, ssl, ipBlacklist] = await Promise.all([
      checkGoogleSafeBrowsing(url),
      checkUrlScan(url),
      getDomainAge(url),
      hasSuspiciousKeyword(url),
      checkSSL(url),
      checkBlacklistIP(url),
    ]);

    const trustScore = calculateTrustScore({
      safeBrowsing,
      urlscan,
      domainAgeInDays: domainAge,
      hasSuspiciousKeyword: suspicious,
      usesHttps: ssl,
      ipInBlacklist: ipBlacklist,
    });

    res.json({ trustScore });
  } catch (err) {
    console.error('❌ Trust score error:', err);
    res.status(500).json({ error: 'Failed to evaluate trust score' });
  }
});

module.exports = router;
