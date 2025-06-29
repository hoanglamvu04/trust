window.onload = function() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  const domain = new URL(redirect).hostname;

  document.getElementById('yes').onclick = () => {
    chrome.storage.local.get({ allowedDomains: [] }, (result) => {
      const allowedDomains = result.allowedDomains;
      if (!allowedDomains.includes(domain)) allowedDomains.push(domain);
      chrome.storage.local.set({ allowedDomains });
      window.location.href = redirect;
    });
  };

  document.getElementById('no').onclick = () => {
    window.location.href = "about:blank";
  };

  // Không cần gán onclick cho link nếu chỉ là link <a>
}
