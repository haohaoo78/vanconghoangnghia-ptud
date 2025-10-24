document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main-content');
  const cache = {};

  document.querySelectorAll('.sidebar a[data-page]').forEach(link => {
    link.addEventListener('click', async e => {
      e.preventDefault();
      const page = link.dataset.page;
      if (!page || !main) return;

      // Nếu có cache thì load lại
      if (cache[page]) {
        main.innerHTML = cache[page];
        return;
      }

      try {
        const res = await fetch(`/api/${page}/render`);
        const html = await res.text();
        main.innerHTML = html;
        cache[page] = html;

        // Kích hoạt script trong nội dung
        main.querySelectorAll('script').forEach(s => {
          const n = document.createElement('script');
          if (s.src) n.src = s.src;
          else n.textContent = s.textContent;
          document.body.appendChild(n);
          s.remove();
        });
      } catch {
        main.innerHTML = `<p style="color:red;">Không tải được ${page}</p>`;
      }
    });
  });
});
