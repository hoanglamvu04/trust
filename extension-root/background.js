const blacklist = [
  "facebook.com",
  "badwebsite.com",
  "xample.com"
];

chrome.webNavigation.onCommitted.addListener((details) => {
  const url = new URL(details.url);
  const domain = url.hostname;

  // Kiểm tra allow param trên URL
  if (url.searchParams.get('allow') === 'once') return;
  if (url.searchParams.get('allow') === 'hour') return;

  // Kiểm tra whitelist 1h
  chrome.storage.local.get({ allowedDomains: [], hourWhitelist: {} }, (result) => {
    // Cho phép vĩnh viễn
    if (result.allowedDomains && result.allowedDomains.includes(domain)) return;

    // Cho phép 1h
    if (result.hourWhitelist && result.hourWhitelist[domain] > Date.now()) return;

    if (blacklist.some(d => domain.includes(d))) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(
          "warning.html?redirect=" +
            encodeURIComponent(details.url)
        ),
      });
    }
  });
});
