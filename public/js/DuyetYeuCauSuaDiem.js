// ========================
// BIẾN DOM CHÍNH
// ========================
const FilterForm = document.getElementById("filter-form");
const KhoiSelect = document.getElementById("Khoi");
const LopSelect = document.getElementById("Lop");
const MonHocSelect = document.getElementById("MonHoc");
const Table = document.getElementById("requests-table");
const Status = document.getElementById("status");

// ========================
// HIỂN THỊ THÔNG BÁO
// ========================
function showMessage(message, type = "info") {
  let toast = document.getElementById("toast-message");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-message";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = "block";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => (toast.style.display = "none"), 600);
  }, 3000);
}

// ========================
// LOAD LỚP THEO KHỐI
// ========================
KhoiSelect.addEventListener("change", async () => {
  LopSelect.innerHTML = '<option value="">-- Chọn lớp --</option>';
  if (!KhoiSelect.value) return;

  try {
    const res = await fetch("/api/duyetsuadiem/getLopTheoKhoi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ MaKhoi: KhoiSelect.value }),
    });
    const data = await res.json();
    LopSelect.innerHTML =
      '<option value="">-- Chọn lớp --</option>' +
      data.map(l => `<option value="${l.MaLop}">${l.TenLop}</option>`).join("");
  } catch (err) {
    console.error(err);
    showMessage("Lỗi khi tải danh sách lớp.", "error");
  }
});

// ========================
// GỬI FORM LỌC
// ========================
FilterForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fData = Object.fromEntries(new FormData(FilterForm).entries());
  if (!fData.Khoi || !fData.Lop || !fData.MonHoc) {
    showMessage("Vui lòng chọn đủ khối, lớp và môn học.", "error");
    return;
  }

  try {
    const res = await fetch("/api/duyetsuadiem/getRequests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fData),
    });
    const data = await res.json();
    renderRequests(data);
    showMessage("Đã tải danh sách yêu cầu.", "success");
  } catch (err) {
    console.error(err);
    showMessage("Lỗi khi tải danh sách.", "error");
  }
});

// ========================
// HIỂN THỊ DANH SÁCH YÊU CẦU
// ========================
function renderRequests(list = []) {
  const tbody = Table.querySelector("tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Không có yêu cầu nào</td></tr>`;
    Status.textContent = "Không có yêu cầu cần xử lý.";
    return;
  }

  tbody.innerHTML = list
    .map(
      (r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.HoTen}</td>
      <td>${r.TenMon}</td>
      <td>${r.LoaiDiem}</td>
      <td>${r.DiemCu}</td>
      <td>${r.DiemMoi}</td>
      <td>${r.LyDo}</td>
      <td class="${
        r.TrangThai === "Chờ duyệt"
          ? "pending"
          : r.TrangThai === "Đã duyệt"
          ? "approved"
          : "rejected"
      }">${r.TrangThai}</td>
      <td>
        ${
          r.TrangThai === "Chờ duyệt"
            ? `<button class="approve-btn" data-id="${r.MaYeuCau}">Duyệt</button>
               <button class="reject-btn" data-id="${r.MaYeuCau}">Từ chối</button>`
            : "<em>Đã xử lý</em>"
        }
      </td>
    </tr>`
    )
    .join("");
  Status.textContent = "Danh sách yêu cầu đã được tải.";
}

// ========================
// SỰ KIỆN DUYỆT / TỪ CHỐI
// ========================
Table.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.classList.contains("approve-btn") ? "approve" : "reject";
  if (!confirm(`Xác nhận ${action === "approve" ? "duyệt" : "từ chối"} yêu cầu này?`)) return;

  try {
    const res = await fetch(`/api/duyetsuadiem/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();

    if (data.success) {
      showMessage(data.message, "success");
      const row = btn.closest("tr");
      const statusCell = row.querySelector("td:nth-child(8)");
      const actionCell = row.querySelector("td:nth-child(9)");
      statusCell.textContent = action === "approve" ? "Đã duyệt" : "Từ chối";
      statusCell.className = action === "approve" ? "approved" : "rejected";
      actionCell.innerHTML = "<em>Đã xử lý</em>";
    } else {
      showMessage(data.message || "Cập nhật thất bại.", "error");
    }
  } catch (err) {
    console.error(err);
    showMessage("Lỗi khi gửi yêu cầu.", "error");
  }
});
