// ========================
// BIẾN DOM CHÍNH
// ========================
const FilterForm = document.getElementById('filter-form');
const KhoiSelect = document.getElementById('Khoi');
const LopSelect = document.getElementById('MaLop');
const NamHocSelect = document.getElementById('NamHoc');
const KyHocSelect = document.getElementById('KyHoc');
const LoaiTKBSelect = document.getElementById('LoaiTKB');
const NamHocStartInput = document.getElementById('NamHocStart');
let subjectsByClass = [];

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
    setTimeout(() => { toast.style.display = "none"; }, 600);
  }, 3000);
}

// ========================
// LOAD LỚP THEO KHỐI
// ========================
KhoiSelect.addEventListener('change', async () => {
  LopSelect.innerHTML = '<option value="">-- Chọn lớp --</option>';
  if (!KhoiSelect.value) return;
  const res = await fetch('/api/thoikhoabieu/getLopTheoKhoi', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ MaKhoi: KhoiSelect.value })
  });
  const data = await res.json();
  LopSelect.innerHTML = data.map(l => `<option value="${l.MaLop}">${l.TenLop}</option>`).join('');
});

// ========================
// LOAD HỌC KỲ THEO NĂM HỌC
// ========================
NamHocSelect.addEventListener('change', async () => {
  const res = await fetch('/api/thoikhoabieu/getKyHocList', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ NamHoc: NamHocSelect.value })
  });
  const list = await res.json();
  KyHocSelect.innerHTML = list.map(k => `<option value="${k.KyHoc}">${k.KyHoc}</option>`).join('');
});

// ========================
// TÍNH NGÀY THỨ 2 ĐẦU TUẦN
// ========================
function getWeekStartDate(startStr, weekNumber) {
  if (!startStr) startStr = '2025-08-01';
  const base = new Date(startStr);
  if (isNaN(base)) return new Date('2025-08-01'); // fallback
  const d = base.getDay(); // 0=CN
  const offset = d === 1 ? 0 : (d === 0 ? 1 : 8 - d);
  base.setDate(base.getDate() + offset + (weekNumber - 1) * 7);
  return base;
}

// ========================
// LOAD TKB
// ========================
FilterForm.addEventListener('submit', e => {
  e.preventDefault(); loadTKB();
});

async function loadTKB() {
  const fData = Object.fromEntries(new FormData(FilterForm).entries());
  if (!fData.Khoi || !fData.MaLop || !fData.NamHoc || !fData.KyHoc) {
    showMessage('Vui lòng chọn đầy đủ khối, lớp, năm học và học kỳ.', 'error'); return;
  }

  const res = await fetch('/api/thoikhoabieu/getAll', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fData)
  });
  const json = await res.json();
  if (!json || json.error) { showMessage('Không thể tải dữ liệu.', 'error'); return; }

  subjectsByClass = json.subjects || [];
  const timetableRaw = json.timetable || {};

  // Chuẩn hóa Thu CN => 8, Thứ 2-7 giữ nguyên
  const timetable = {};
  Object.keys(timetableRaw).forEach(thuKey => {
    const d = thuKey === "CN" ? 8 : parseInt(thuKey);
    timetable[d] = timetable[d] || {};
    Object.keys(timetableRaw[thuKey]).forEach(tiet => {
      timetable[d][tiet] = timetableRaw[thuKey][tiet];
    });
  });

  if (!Object.keys(timetable).length) {
    const msg = fData.LoaiTKB === 'Chuan'
      ? 'Chưa có thời khóa biểu chuẩn.'
      : 'Chưa có thời khóa biểu tuần này.';
    showMessage(msg, 'warn');
  } else { showMessage('Đã tải TKB thành công.', 'success'); }

  NamHocStartInput.value = json.selectedNamHocStart || '2025-08-01';
  const weekNumber = fData.LoaiTKB === 'Chuan' ? 1 : parseInt(fData.LoaiTKB.replace('Tuan',''));
  const weekStart = getWeekStartDate(NamHocStartInput.value, weekNumber);
  renderTimetable(timetable, weekStart);
}

// ========================
// RENDER BẢNG TKB
// ========================
function renderTimetable(tt, weekStart) {
  let html = '<thead><tr><th>Tiết / Thứ</th>';
  for (let d = 2; d <= 8; d++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + (d - 2));
    const thuName = d === 8 ? 'Chủ nhật' : `Thứ ${d}`;
    html += `<th>${thuName}<br><small>${day.toLocaleDateString('vi-VN')}</small></th>`;
  }
  html += '</tr></thead><tbody>';

  // Buổi sáng
  html += `<tr class="session-header"><td colspan="8">Buổi sáng</td></tr>`;
  for (let p = 1; p <= 5; p++) html += createRow(tt, p);

  // Buổi chiều
  html += `<tr class="session-header"><td colspan="8">Buổi chiều</td></tr>`;
  for (let p = 6; p <= 10; p++) html += createRow(tt, p);

  html += '</tbody>';
  document.getElementById('timetable-table').innerHTML = html;
  attachSubjectChangeEvents();
}

// ========================
// TẠO DÒNG TIẾT
// ========================
function createRow(tt, p) {
  let row = `<tr><td>${p}</td>`;
  for (let d = 2; d <= 8; d++) {
    const cell = tt[d]?.[p] || {};
    row += `<td>
      <select class="subject-select" data-thu="${d}" data-tiet="${p}">
        <option value="">-- Môn học --</option>
        ${subjectsByClass.map(s => `<option value="${s.TenMonHoc}" ${cell.subject === s.TenMonHoc ? 'selected' : ''}>${s.TenMonHoc}</option>`).join('')}
      </select>
      <div class="teacher" id="teacher-${d}-${p}">${cell.teacher || ''}</div>
    </td>`;
  }
  return row + '</tr>';
}

// ========================
// SỰ KIỆN CHỌN MÔN
// ========================
function attachSubjectChangeEvents() {
  document.querySelectorAll('.subject-select').forEach(sel => {
    sel.addEventListener('change', async function () {
      const TenMonHoc = this.value;
      const Thu = this.dataset.thu;
      const Tiet = this.dataset.tiet;
      const div = document.getElementById(`teacher-${Thu}-${Tiet}`);
      if (!TenMonHoc) { div.innerText = ''; div.classList.remove('missing'); return; }

      const f = FilterForm;
      const res = await fetch('/api/thoikhoabieu/getTeacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MaLop: f.MaLop.value, TenMonHoc })
      });
      const data = await res.json();
      if (data?.TenGiaoVien) { div.innerText = data.TenGiaoVien; div.classList.remove('missing'); }
      else { div.innerText = 'Chưa phân công'; div.classList.add('missing'); }
    });
  });
}

// ========================
// LƯU TKB
// ========================
document.getElementById('save-timetable').addEventListener('click', async () => {
  const f = FilterForm;
  const timetableData = [];
  const namHocStart = f.NamHocStart.value;
  if (!namHocStart || isNaN(new Date(namHocStart))) {
    showMessage('Ngày bắt đầu năm học không hợp lệ.', 'error');
    return;
  }

  document.querySelectorAll('.subject-select').forEach(sel => {
    if (sel.value) {
      timetableData.push({
        MaLop: f.MaLop.value,
        NamHoc: f.NamHoc.value,
        KyHoc: f.KyHoc.value,
        LoaiTKB: f.LoaiTKB.value,
        Thu: sel.dataset.thu === "8" ? "CN" : sel.dataset.thu,
        TietHoc: sel.dataset.tiet,
        TenMonHoc: sel.value
      });
    }
  });

  if (!timetableData.length) { showMessage('Không có dữ liệu để lưu.', 'error'); return; }

  const res = await fetch('/api/thoikhoabieu/saveAll', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timetable: timetableData, selectedNamHocStart: namHocStart })
  });
  const result = await res.json();
  if (result.error) showMessage('Lưu thất bại.', 'error');
  else showMessage('Lưu TKB thành công.', 'success');
});

// ========================
// RESET TKB
// ========================
const resetBox = document.getElementById('reset-confirm');
const yesBtn = document.getElementById('confirm-yes');
const noBtn = document.getElementById('confirm-no');

document.getElementById('reset-week').addEventListener('click', () => {
  const f = FilterForm;
  if (f.LoaiTKB.value === 'Chuan') { showMessage('Không thể đặt lại TKB chuẩn.', 'error'); return; }
  resetBox.style.display = 'flex';
});

noBtn.addEventListener('click', () => resetBox.style.display = 'none');
yesBtn.addEventListener('click', async () => {
  resetBox.style.display = 'none';
  const f = FilterForm;
  const res = await fetch('/api/thoikhoabieu/resetWeek', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      MaLop: f.MaLop.value,
      NamHoc: f.NamHoc.value,
      KyHoc: f.KyHoc.value,
      LoaiTKB: f.LoaiTKB.value
    })
  });
  const data = await res.json();
  if (data.error) showMessage('Đặt lại thất bại.', 'error');
  else showMessage('Đặt lại tuần thành công.', 'success');
  loadTKB();
});
