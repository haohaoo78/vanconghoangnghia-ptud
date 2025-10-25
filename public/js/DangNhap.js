document.addEventListener('DOMContentLoaded', () => {

  // LOGIN
  const loginForm = document.getElementById('login-form');
  const msgEl = document.getElementById('error-message');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

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
          setTimeout(() => {
            window.location.href = data.redirect || '/';
          }, 800);
        } else {
          msgEl.textContent = data.message;
          msgEl.classList.add('error');
        }
      } catch (err) {
        msgEl.textContent = '❌ Lỗi server, thử lại sau.';
        msgEl.classList.add('error');
        console.error(err);
      }
    });
  }

  // LOGOUT (event delegation để luôn bắt được)
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logout-btn') {
      window.location.href = '/DangXuat';
    }
  });

});
