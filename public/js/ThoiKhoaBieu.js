// ======= DOM và biến =======
const FilterForm=document.getElementById('filter-form');
const KhoiSelect=document.getElementById('Khoi');
const LopSelect=document.getElementById('MaLop');
const NamHocSelect=document.getElementById('NamHoc');
const KyHocSelect=document.getElementById('KyHoc');
const LoaiTKBSelect=document.getElementById('LoaiTKB');
const NamHocStartInput=document.getElementById('NamHocStart');
let subjectsByClass=[];

// ======= Load lớp theo khối =======
KhoiSelect.addEventListener('change',async()=>{
  LopSelect.innerHTML='<option value="">--Chọn lớp--</option>';
  const MaKhoi=KhoiSelect.value;
  if(!MaKhoi) return;
  const res=await fetch('/api/thoikhoabieu/getLopTheoKhoi',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({MaKhoi})
  });
  const lopData=await res.json();
  LopSelect.innerHTML=lopData.map(l=>`<option value="${l.MaLop}">${l.TenLop}</option>`).join('');
});

// ======= Load học kỳ =======
NamHocSelect.addEventListener('change',async()=>{
  const res=await fetch('/api/thoikhoabieu/getKyHocList',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({NamHoc:NamHocSelect.value})
  });
  const list=await res.json();
  KyHocSelect.innerHTML=list.map(k=>`<option value="${k.KyHoc}">${k.KyHoc}</option>`).join('');
});

// ======= Hàm lấy ngày Thứ 2 đầu tiên của tuần =======
function getWeekStartDate(startDateStr,weekNumber){
  const base=new Date(startDateStr);
  const d=base.getDay(); // 0=CN,1=T2
  const offset=d===1?0:(d===0?1:8-d);
  base.setDate(base.getDate()+offset+(weekNumber-1)*7);
  return base;
}

// ======= Load TKB =======
FilterForm.addEventListener('submit',e=>{e.preventDefault();loadTKB();});

async function loadTKB(){
  const formData=Object.fromEntries(new FormData(FilterForm).entries());
  if(!formData.MaLop||!formData.NamHoc){alert('Chọn đủ Lớp và Năm học');return;}
  const res=await fetch('/api/thoikhoabieu/getAll',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(formData)
  });
  const json=await res.json();
  subjectsByClass=json.subjects||[];
  const timetable=json.timetable||{};
  NamHocStartInput.value=json.selectedNamHocStart||'2025-08-01';
  let weekNumber=formData.LoaiTKB==='Chuan'?1:parseInt(formData.LoaiTKB.replace('Tuan',''));
  const weekStart=getWeekStartDate(NamHocStartInput.value,weekNumber);

  let html='<thead><tr><th>Tiết / Thứ</th>';
  for(let d=2;d<=8;d++){
    const dayDate=new Date(weekStart);dayDate.setDate(weekStart.getDate()+(d-2));
    const thuName=d===8?'CN':`Thứ ${d}`;
    html+=`<th data-date="${dayDate.toISOString().slice(0,10)}">${thuName} (${dayDate.toLocaleDateString('vi-VN')})</th>`;
  }
  html+='</tr></thead><tbody>';
  for(let p=1;p<=10;p++){
    html+=`<tr><td>${p}</td>`;
    for(let d=2;d<=8;d++){
      const dayDate=new Date(weekStart);dayDate.setDate(weekStart.getDate()+(d-2));
      const cell=timetable[d]?.[p]||{};
      html+=`<td>
        <select class="subject-select" data-thu="${d===8?7:d}" data-tiet="${p}" data-date="${dayDate.toISOString().slice(0,10)}">
          <option value="">--Môn--</option>
          ${subjectsByClass.map(s=>`<option value="${s.TenMonHoc}" ${cell.subject===s.TenMonHoc?'selected':''}>${s.TenMonHoc}</option>`).join('')}
        </select>
        <div class="teacher" id="teacher-${d}-${p}">${cell.teacher||''}</div>
      </td>`;
    }
    html+='</tr>';
  }
  html+='</tbody>';
  document.getElementById('timetable-table').innerHTML=html;

  // gán onchange
  document.querySelectorAll('.subject-select').forEach(sel=>{
    sel.addEventListener('change',async function(){
      const TenMonHoc=this.value,Thu=this.dataset.thu,TietHoc=this.dataset.tiet;
      const div=document.getElementById(`teacher-${Thu}-${TietHoc}`);
      if(!TenMonHoc){div.innerText='';div.classList.remove('missing');return;}
      const res=await fetch('/api/thoikhoabieu/getTeacher',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({MaLop:formData.MaLop,TenMonHoc})
      });
      const data=await res.json();
      if(data?.TenGiaoVien){div.innerText=data.TenGiaoVien;div.classList.remove('missing');}
      else{div.innerText='Chưa phân công bộ môn';div.classList.add('missing');}
    });
  });
}

// ======= Lưu TKB =======
document.getElementById('save-timetable').addEventListener('click',async()=>{
  const f=FilterForm;
  const timetableData=[];
  document.querySelectorAll('.subject-select').forEach(sel=>{
    if(sel.value)timetableData.push({
      MaLop:f.MaLop.value,
      NamHoc:f.NamHoc.value,
      KyHoc:f.KyHoc.value,
      LoaiTKB:f.LoaiTKB.value,
      Thu:sel.dataset.thu,
      TietHoc:sel.dataset.tiet,
      TenMonHoc:sel.value
    });
  });
  const res=await fetch('/api/thoikhoabieu/saveAll',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({timetable:timetableData,selectedNamHocStart:f.NamHocStart.value})
  });
  const result=await res.json();
  alert(result.message);
  loadTKB();
});

// ======= Reset tuần =======
document.getElementById('reset-week').addEventListener('click',async()=>{
  const f=FilterForm;
  if(f.LoaiTKB.value==='Chuan'){alert('Không thể reset TKB chuẩn');return;}
  if(!confirm(`Bạn có muốn reset ${f.LoaiTKB.value} về TKB chuẩn không?`))return;
  const res=await fetch('/api/thoikhoabieu/resetWeek',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({MaLop:f.MaLop.value,NamHoc:f.NamHoc.value,KyHoc:f.KyHoc.value,LoaiTKB:f.LoaiTKB.value})
  });
  const data=await res.json();
  alert(data.message);
  loadTKB();
});