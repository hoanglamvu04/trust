const axios = require("axios");
const cheerio = require("cheerio");

async function checkChongLuaDao(domain) {
  try {
    const res = await axios.post("https://api.chongluadao.vn/v1/check-url", {
      url: `https://${domain}`,
    });
    const type = res.data?.data?.type || "Không xác định";
    return { provider: "ChongLuaDao.vn", type: "Phân loại", value: type };
  } catch {
    return { provider: "ChongLuaDao.vn", type: "Phân loại", value: "Lỗi khi truy vấn" };
  }
}

async function checkGoogleWebRisk(domain, apiKey = process.env.GOOGLE_WEBRISK_KEY) {
  try {
    const res = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: { clientId: "trustcheck", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: `https://${domain}` }],
        },
      }
    );
    const hasThreat = res.data?.matches?.length > 0;
    return {
      provider: "Google Web Risk",
      type: "Danh sách lừa đảo",
      value: hasThreat ? "Có trong danh sách đen" : "Không tìm thấy",
    };
  } catch {
    return { provider: "Google Web Risk", type: "Danh sách lừa đảo", value: "Lỗi khi truy vấn" };
  }
}

async function checkScamAdviser(domain, apiKey = process.env.SCAMADVISER_KEY) {
  try {
    const res = await axios.get(`https://api.scamadviser.com/v1/domain/${domain}`, {
      headers: { "x-api-key": apiKey },
    });
    const trust = res.data?.trustscore || "Không xác định";
    return {
      provider: "ScamAdviser",
      type: "Độ tin cậy",
      value: `${trust}/100`,
    };
  } catch {
    return { provider: "ScamAdviser", type: "Độ tin cậy", value: "Lỗi khi truy vấn" };
  }
}

async function checkTinNhiemMang(domain) {
  try {
    const res = await axios.get("https://tinnhiemmang.vn/website-lua-dao");
    const $ = cheerio.load(res.data);
    const found = $(".search-result .url").toArray().some((el) =>
      $(el).text().includes(domain)
    );
    return {
      provider: "TinNhiemMang.vn (NCSC)",
      type: "Đánh giá tin cậy",
      value: found ? "Không đạt tiêu chuẩn tin cậy" : "Không có trong danh sách đen",
    };
  } catch {
    return {
      provider: "TinNhiemMang.vn (NCSC)",
      type: "Đánh giá tin cậy",
      value: "Lỗi khi truy vấn",
    };
  }
}

async function checkAllSources(domain) {
  const results = await Promise.allSettled([
    checkChongLuaDao(domain),
    checkGoogleWebRisk(domain),
    checkScamAdviser(domain),
    checkTinNhiemMang(domain),
  ]);

  return results.map((r) =>
    r.status === "fulfilled" ? r.value : { provider: "Không xác định", type: "Lỗi", value: "Lỗi không xác định" }
  );
}

module.exports = {
  checkAllSources,
};
