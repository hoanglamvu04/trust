const puppeteer = require("puppeteer");
const { checkAllSources } = require("../services/preCheckAnalysis"); 

exports.checkDomain = async (req, res) => {
  const { domain } = req.body;
  const url = domain.startsWith("http") ? domain : `https://${domain}`;

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });

    const html = await page.content();
    await browser.close();

    // check nhiều nguồn thật
    const sources = await checkAllSources(domain);

    // basic rule-based signals từ nội dung HTML (miễn phí)
    const signals = [];
    if (html.includes("eval(")) signals.push("Sử dụng eval()");
    if (html.includes("atob(")) signals.push("Sử dụng atob()");
    if (html.includes("setTimeout") && html.includes("location.href"))
      signals.push("Có chuyển hướng sau khi tải");

    const result = {
      risk: Math.min(signals.length * 2, 10),
      category: signals.length ? "Có dấu hiệu nghi ngờ" : "An toàn",
      signals,
      status: signals.length ? "Nghi ngờ" : "Bình thường",
      recommendation: signals.length
        ? "Nên kiểm tra thêm thông tin chủ sở hữu, nguồn script và liên kết."
        : "Không có dấu hiệu nguy hiểm.",
      time: new Date().toLocaleString("vi-VN", { hour12: false }),
      sources,
    };

    res.json({
      exists: true,
      aiAnalysis: result,
    });
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra domain:", err.message);
    res.json({ exists: false });
  }
};
