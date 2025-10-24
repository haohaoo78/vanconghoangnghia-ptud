document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const res = await fetch('/DangNhap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json().catch(() => null);
  if (!data) return alert('Phản hồi server không hợp lệ.');

  if (data.success) {
    alert(data.message);
    window.location.href = data.redirect;
  } else {
    alert(data.message);
  }
});
