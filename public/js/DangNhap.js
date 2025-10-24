document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const msgEl = document.getElementById('error-message');

  // Xóa thông báo cũ
  msgEl.textContent = '';
  msgEl.classList.remove('success', 'error');

  try {
    const res = await fetch('/DangNhap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      msgEl.textContent = data.message;
      msgEl.classList.add('success');

      // Tùy chọn: redirect sau 1s
      setTimeout(() => {
        window.location.href = data.redirect || '/';
      }, 1000);
    } else {
      msgEl.textContent = data.message;
      msgEl.classList.add('error');
    }
  } catch (err) {
    msgEl.textContent = '❌ Lỗi server, thử lại sau.';
    msgEl.classList.add('error');
    console.error(err);
  }

  // Đăng xuất
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/DangXuat', {
        method: 'POST', // hoặc GET tùy route server
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Nếu server redirect, có thể dùng response.json() để thông báo
      // Hoặc trực tiếp redirect
      window.location.href = '/DangNhap';
    } catch (err) {
      alert('❌ Lỗi khi đăng xuất, thử lại.');
      console.error(err);
    }
  });
}

});
