export function lagDummyPdfFormData(tittel: "Vedtak" | "Forelopig svar"): FormData {
  const tekst = `BT /F1 18 Tf 72 720 Td (${tittel} - testdokument) Tj ET`;
  const objekter = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${tekst.length} >>\nstream\n${tekst}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objekter.map((objekt, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${objekt}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objekter.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objekter.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  const formData = new FormData();
  formData.append("file", new Blob([pdf], { type: "application/pdf" }), `${tittel}.pdf`);
  return formData;
}
