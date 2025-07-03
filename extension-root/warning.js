document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  const domain = redirect ? new URL(redirect).hostname : "";

  // Hiện domain lên giao diện
  document.getElementById('domain').textContent = domain;

  // Helper chrome.storage.local promise style
  function getStorage(key, def = null) {
    return new Promise(res => {
      chrome.storage.local.get({ [key]: def }, result => res(result[key]));
    });
  }
  function setStorage(obj) {
    return new Promise(res => chrome.storage.local.set(obj, res));
  }

  // Chỉ cho phép lần này (session, mọi tab đều được, đóng browser là hết)
  document.getElementById('btn-once').onclick = async () => {
    let allowedSession = await getStorage('allowedSession', []);
    if (!allowedSession.includes(domain)) {
      allowedSession.push(domain);
      await setStorage({ allowedSession });
    }
    window.location.href = addParam(redirect, "allow", "session");
  };

  // Cho phép & tắt cảnh báo X giờ
  document.getElementById('btn-time').onclick = async () => {
    const hours = parseInt(document.getElementById('timed-allow').value, 10);
    let allowedTimed = await getStorage('allowedTimed', {});
    allowedTimed[domain] = Date.now() + hours * 60 * 60 * 1000;
    await setStorage({ allowedTimed });
    window.location.href = addParam(redirect, "allow", `hour${hours}`);
  };

  // Luôn cho phép
  document.getElementById('btn-always').onclick = async () => {
    let allowedDomains = await getStorage('allowedDomains', []);
    if (!allowedDomains.includes(domain)) {
      allowedDomains.push(domain);
      await setStorage({ allowedDomains });
    }
    window.location.href = redirect;
  };

  // Quay lại an toàn
  document.getElementById('btn-cancel').onclick = () => {
    window.location.href = "safe.html";
  };

  // Thêm param vào url cho background check (tránh vòng lặp)
  function addParam(url, key, value) {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  }
});
