const { checkPhishTank } = require('./phishTankService');

async function calculateTrustScore(domainOrUrl) {
    let score = 100;
    let explanations = [];

    // Tích hợp PhishTank
    const phishRes = await checkPhishTank(domainOrUrl);
    score += phishRes.scoreDelta;
    explanations.push(phishRes.explanation);

    // Có thể bổ sung thêm tiêu chí khác tại đây

    if (score > 100) score = 100;
    if (score < 1) score = 1;

    // Map score thành nhãn nếu muốn
    let level = "an toàn";
    if (score < 50) level = "nguy hiểm";
    else if (score < 80) level = "cảnh báo";

    return {
        domain: domainOrUrl,
        score,
        level,
        details: explanations,
    };
}

module.exports = { calculateTrustScore };
