function renderList(domains) {
  const list = document.getElementById('domain-list');
  list.innerHTML = '';
  domains.forEach(domain => {
    const li = document.createElement('li');
    li.textContent = domain;
    const btn = document.createElement('button');
    btn.textContent = 'Bỏ chặn';
    btn.onclick = () => {
      chrome.storage.local.get({ allowedDomains: [] }, (result) => {
        const allowedDomains = result.allowedDomains.filter(d => d !== domain);
        chrome.storage.local.set({ allowedDomains }, () => {
          renderList(allowedDomains);
        });
      });
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

chrome.storage.local.get({ allowedDomains: [] }, (result) => {
  renderList(result.allowedDomains);
});
