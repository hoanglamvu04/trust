// controllers/trustScoreController.js
const { calculateTrustScore } = require('../services/trustScoreService');

exports.checkTrustScore = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'Thiếu url' });

        const result = await calculateTrustScore(url);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Lỗi server' });
    }
};
