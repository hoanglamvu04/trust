let blacklist = [];

// Load blacklist từ blacklist.json khi extension khởi động
async function loadBlacklist() {
  try {
    const resp = await fetch(chrome.runtime.getURL('blacklist.json'));
    const data = await resp.json();
    blacklist = data.blacklist || [];
  } catch (e) {
    blacklist = [];
  }
}

// Gọi loadBlacklist khi extension chạy
loadBlacklist();

// Nếu cần, tự reload blacklist sau mỗi X phút
setInterval(loadBlacklist, 5 * 60 * 1000); // 5 phút

chrome.webNavigation.onCommitted.addListener((details) => {
  const url = new URL(details.url);
  const domain = url.hostname;

  // Nếu có allow trên url => bỏ qua cảnh báo lần này
  const allowParam = url.searchParams.get('allow');
  if (allowParam === 'session' || (allowParam && allowParam.startsWith('hour'))) return;

  chrome.storage.local.get(
    { allowedDomains: [], allowedSession: [], allowedTimed: {} },
    (result) => {
      if (result.allowedDomains.includes(domain)) return;
      if (result.allowedSession.includes(domain)) return;
      const timed = result.allowedTimed[domain];
      if (timed && timed > Date.now()) return;

      // Dùng some() để so domain
      if (blacklist.some(d => domain.includes(d))) {
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL(
            "warning.html?redirect=" + encodeURIComponent(details.url)
          ),
        });
      }
    }
  );
});
