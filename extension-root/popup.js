document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const msg = document.getElementById('msg');
  const skipBtn = document.getElementById('skipBtn');
  const remindBtn = document.getElementById('remindBtn');

  // Đăng nhập
const API_URL = 'http://localhost:5000/api/auth/login';

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  msg.textContent = '';
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) {
    msg.textContent = 'Vui lòng nhập đầy đủ thông tin!';
    return;
  }
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await resp.json();
    if (!data.success) {
      msg.textContent = data.message || 'Đăng nhập thất bại!';
      return;
    }
    await chrome.storage.local.set({
      token: data.token,
      user: data.user,
      loginTime: Date.now()
    });
    msg.style.color = "#22bb66";
    msg.textContent = "Đăng nhập thành công!";
    setTimeout(() => {
    window.location.href = "popup-loggedin.html";
    }, 800);
  } catch (err) {
    msg.textContent = 'Không thể kết nối máy chủ!';
  }
};

  // Không đăng nhập
  skipBtn.onclick = () => {
    window.close();
  };

  // Nhắc lại sau
  remindBtn.onclick = async () => {
    // Ví dụ: nhắc lại sau 30 phút, bạn có thể popup lựa chọn thời gian nếu muốn
    const remindMinutes = 30;
    await chrome.storage.local.set({
      remindLater: Date.now() + remindMinutes * 60 * 1000
    });
    window.close();
  };
});
