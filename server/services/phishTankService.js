const axios = require('axios');

/**
 * Kiểm tra domain/url với PhishTank.
 * API miễn phí, nhưng chỉ trả về dữ liệu mới nếu query bằng API token.
 */
async function checkPhishTank(domainOrUrl) {
    try {
        // Lấy dạng domain nếu người dùng nhập full url
        let url = domainOrUrl;
        if (!/^https?:\/\//.test(url)) url = 'http://' + url;

        const res = await axios.get(
            `https://checkurl.phishtank.com/checkurl/`,
            {
                params: {
                    format: 'json',
                    url
                }
            }
        );

        // Kết quả: nếu is_phish là true => cảnh báo
        const { results } = res.data;
        if (results && results.valid && results.in_database && results.verified && results.phish_id) {
            return {
                scoreDelta: -90,
                explanation: `PhishTank: Cảnh báo lừa đảo! (${results.url})`,
            };
        } else {
            return {
                scoreDelta: 0,
                explanation: 'PhishTank: Không phát hiện lừa đảo.',
            };
        }
    } catch (err) {
        console.error('PhishTank error:', err.message);
        return {
            scoreDelta: 0,
            explanation: 'PhishTank: Không kiểm tra được.',
        };
    }
}

module.exports = { checkPhishTank };
