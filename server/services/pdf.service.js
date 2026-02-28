import PDFDocument from 'pdfkit';

export function generatePrescriptionPDF(prescription, patient, doctor) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('PRESCRIPTION', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(12).text(`Patient: ${patient?.name || 'N/A'}`, { continued: false });
    doc.text(`Age: ${patient?.age || 'N/A'} | Gender: ${patient?.gender || 'N/A'}`, { continued: false });
    doc.text(`Contact: ${patient?.contact || 'N/A'}`, { continued: false });
    doc.moveDown();

    if (prescription.diagnosis) {
      doc.fontSize(11).text(`Diagnosis: ${prescription.diagnosis}`, { continued: false });
      doc.moveDown();
    }

    doc.fontSize(11).text('Medicines:', { underline: true });
    doc.moveDown(0.5);
    prescription.medicines?.forEach((m, i) => {
      doc.text(`${i + 1}. ${m.name}`, { continued: false });
      doc.text(`   Dosage: ${m.dosage} | ${m.frequency} | ${m.duration}`, { indent: 20 });
    });
    doc.moveDown();

    if (prescription.instructions) {
      doc.text(`Instructions: ${prescription.instructions}`, { continued: false });
      doc.moveDown();
    }

    doc.moveDown(2);
    doc.text(`Dr. ${doctor?.name || 'N/A'}`, { align: 'right' });
    doc.text(doctor?.specialization || '', { align: 'right' });

    doc.end();
  });
}
