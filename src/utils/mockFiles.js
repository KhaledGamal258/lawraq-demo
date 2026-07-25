// Mock file generators for the CasePage "فتح" (open) document action.
// Pure front-end, no backend — every blob below is a real, valid file of
// its type (not a fake placeholder that would error on open).

function buildMockPdfBlob(lines) {
  const content = lines.map((line, i) => `BT /F1 ${i === 0 ? 18 : 12} Tf 72 ${700 - i * 26} Td (${line}) Tj ET`).join('\n');
  const stream = content;

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

// --- minimal ZIP (STORED, uncompressed) builder — enough to make a real,
// openable .docx without a compression library ---

function makeCrcTable() {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}
const CRC_TABLE = makeCrcTable();
function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n) { return [n & 0xff, (n >> 8) & 0xff]; }
function u32(n) { return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff]; }

function buildZip(entries) {
  const encoder = new TextEncoder();
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  entries.forEach(({ name, data }) => {
    const nameBytes = Array.from(encoder.encode(name));
    const crc = crc32(data);
    const localHeader = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length),
      ...u16(nameBytes.length), ...u16(0), ...nameBytes,
    ]);
    localChunks.push(localHeader, data);

    const centralHeader = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length),
      ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0),
      ...u32(offset), ...nameBytes,
    ]);
    centralChunks.push(centralHeader);

    offset += localHeader.length + data.length;
  });

  const centralSize = centralChunks.reduce((s, c) => s + c.length, 0);
  const centralOffset = offset;
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length),
    ...u32(centralSize), ...u32(centralOffset), ...u16(0),
  ]);

  return new Blob([...localChunks, ...centralChunks, end], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

function buildMockDocxBlob(docName, docDate) {
  const encoder = new TextEncoder();
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>LAWRAQ — منصة إدارة المكتب القانوني</w:t></w:r></w:p>
    <w:p><w:r><w:t>${esc(`المستند: ${docName}`)}</w:t></w:r></w:p>
    <w:p><w:r><w:t>${esc(`التاريخ: ${docDate}`)}</w:t></w:r></w:p>
    <w:p><w:r><w:t>هذا مستند تجريبي (Word) لأغراض العرض التوضيحي فقط.</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  return buildZip([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
    { name: '_rels/.rels', data: encoder.encode(rootRels) },
    { name: 'word/document.xml', data: encoder.encode(documentXml) },
  ]);
}

function buildMockImageBlob(docName, docDate) {
  const canvas = document.createElement('canvas');
  canvas.width = 850;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#F6F4F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1C2D4F';
  ctx.fillRect(0, 0, canvas.width, 12);

  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1C2D4F';
  ctx.font = 'bold 34px Arial';
  ctx.fillText('LAWRAQ — منصة إدارة المكتب القانوني', canvas.width - 60, 100);

  ctx.font = '22px Arial';
  ctx.fillStyle = '#5D6579';
  ctx.fillText(`المستند: ${docName}`, canvas.width - 60, 160);
  ctx.fillText(`التاريخ: ${docDate}`, canvas.width - 60, 195);

  ctx.strokeStyle = '#E8E4DC';
  ctx.lineWidth = 2;
  for (let y = 260; y < canvas.height - 80; y += 44) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(canvas.width - 60, y);
    ctx.stroke();
  }

  ctx.font = '18px Arial';
  ctx.fillStyle = '#9BA3AF';
  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillText('Demo placeholder image — simulates a scanned document photo', canvas.width / 2, canvas.height - 40);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}

function openInNewTab(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const FILE_TYPE_LABELS = { pdf: 'PDF', image: 'JPG', word: 'DOCX' };

export function getFileTypeLabel(type) {
  return FILE_TYPE_LABELS[type] || 'FILE';
}

export async function openMockDocument(doc) {
  const { name, date, type } = doc;
  if (type === 'word') {
    const blob = buildMockDocxBlob(name, date);
    downloadBlob(blob, `${name}.docx`);
    return;
  }
  if (type === 'image') {
    const blob = await buildMockImageBlob(name, date);
    openInNewTab(blob);
    return;
  }
  const blob = buildMockPdfBlob([
    'LAWRAQ — Legal Practice Platform',
    `Document: ${name}`,
    `Date: ${date}`,
    '',
    'This is a demo placeholder — simulates opening and',
    'printing a case document from a phone, in court,',
    'without returning to the office.',
  ]);
  openInNewTab(blob);
}
