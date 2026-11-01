// Chạy ở gốc repo: node tools/cap-nhat-tien-do.js
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'progress');
const overview = path.join(dir, 'TONG_QUAN.md');
const BEGIN = '<!-- BEGIN:TIEN_DO -->';
const END = '<!-- END:TIEN_DO -->';

const files = fs.readdirSync(dir).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
const rows = [];
const byOwner = {};
let totalDone = 0, totalAll = 0;

for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const title = (text.match(/^#\s+(.+)$/m) || [, f])[1].trim();
  const owner = (text.match(/\*\*Người phụ trách:\*\*\s*(.+?)\s*$/m) || [, '?'])[1].trim();
  const status = (text.match(/\*\*Trạng thái:\*\*\s*(.+?)\s*$/m) || [, '?'])[1].trim();
  const done = (text.match(/^- \[[xX]\]/gm) || []).length;
  const open = (text.match(/^- \[ \]/gm) || []).length;
  const all = done + open;
  const pct = all ? Math.round(done * 100 / all) : 0;
  rows.push(`| ${f.replace('.md', '')} | ${title} | ${owner} | ${status} | ${done}/${all} | ${pct}% |`);
  byOwner[owner] = byOwner[owner] || { done: 0, all: 0 };
  byOwner[owner].done += done;
  byOwner[owner].all += all;
  totalDone += done;
  totalAll += all;
}

const now = new Date();
const stamp = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN');
let out = `${BEGIN}\n_Cập nhật tự động: ${stamp}_\n\n`;
out += '**Tổng: ' + totalDone + '/' + totalAll + ' việc (' + (totalAll ? Math.round(totalDone * 100 / totalAll) : 0) + '%)**\n\n';
out += '| File | Chức năng | Phụ trách | Trạng thái | Việc | % |\n|---|---|---|---|---|---|\n';
out += rows.join('\n') + '\n\n';
out += '| Thành viên | Việc | % |\n|---|---|---|\n';
for (const [k, v] of Object.entries(byOwner)) {
  out += `| ${k} | ${v.done}/${v.all} | ${v.all ? Math.round(v.done * 100 / v.all) : 0}% |\n`;
}
out += END;

let ov = fs.readFileSync(overview, 'utf8');
const i = ov.indexOf(BEGIN), j = ov.indexOf(END);
if (i < 0 || j < 0) { console.error('Không thấy dòng đánh dấu trong TONG_QUAN.md'); process.exit(1); }
ov = ov.slice(0, i) + out + ov.slice(j + END.length);
fs.writeFileSync(overview, ov, 'utf8');
console.log('Đã cập nhật progress/TONG_QUAN.md: ' + totalDone + '/' + totalAll + ' việc');
