/**
 * Generate contract PDF with actual content and signature boxes for offline signing
 * Combines html2canvas + jsPDF (for content) with pdf-lib (for signature boxes)
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ContractLinkData } from '@/types/contracts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Convert Romanian text to ASCII-safe text for PDF
 */
function toAsciiSafe(text: string): string {
  return text
    .replace(/Ă/g, 'A')
    .replace(/ă/g, 'a')
    .replace(/Â/g, 'A')
    .replace(/â/g, 'a')
    .replace(/Î/g, 'I')
    .replace(/î/g, 'i')
    .replace(/Ș/g, 'S')
    .replace(/ș/g, 's')
    .replace(/Ț/g, 'T')
    .replace(/ț/g, 't');
}

/**
 * Generate PDF from HTML contract content
 */
async function generatePDFFromHTML(contractHtml: string): Promise<Uint8Array> {
  // Create temporary div to render HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contractHtml;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.padding = '20mm';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.color = 'black';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.fontSize = '12pt';
  tempDiv.style.lineHeight = '1.6';

  document.body.appendChild(tempDiv);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions to fit page
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Get PDF as ArrayBuffer
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return new Uint8Array(pdfArrayBuffer);
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
}

/**
 * Generate contract PDF with designated signature areas for admin and client
 * Combines HTML content rendering with signature box overlays
 */
export async function generateContractPDFWithSignatureBoxes(
  contractData: ContractLinkData
): Promise<Uint8Array> {
  // Step 1: Generate PDF from HTML contract content
  if (!contractData.contractHtml) {
    throw new Error('Contract HTML is required');
  }

  const basePdfBytes = await generatePDFFromHTML(contractData.contractHtml);

  // Step 2: Load PDF with pdf-lib to add signature page
  const pdfDoc = await PDFDocument.load(basePdfBytes);

  // Add new page for signatures
  const signaturePage = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = signaturePage.getSize();

  // Load fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  let currentY = height - 50;

  // Title for signature page
  signaturePage.drawText(toAsciiSafe('PAGINA DE SEMNATURI'), {
    x: 50,
    y: currentY,
    size: 18,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  currentY -= 40;

  // Instructions
  signaturePage.drawText(toAsciiSafe('INSTRUCTIUNI:'), {
    x: 50,
    y: currentY,
    size: 12,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  currentY -= 20;

  const instructions = [
    toAsciiSafe('1. Deschideti acest PDF in Adobe Acrobat Reader DC'),
    toAsciiSafe('2. Mergeti la Tools > Certificates > Digitally Sign'),
    toAsciiSafe('3. SAU mergeti la Tools > Fill & Sign > Add Signature'),
    toAsciiSafe('4. Faceti clic si trageti in caseta corespunzatoare de mai jos'),
    toAsciiSafe('5. Selectati certificatul digital din smart card/USB token'),
    toAsciiSafe('6. Introduceti PIN-ul si confirmati semnarea'),
    toAsciiSafe('7. Salvati PDF-ul semnat si incarcati-l inapoi in aplicatie'),
  ];

  instructions.forEach(instruction => {
    signaturePage.drawText(instruction, {
      x: 60,
      y: currentY,
      size: 10,
      font: timesRomanFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 15;
  });

  currentY -= 30;

  // Admin signature box
  const adminBoxX = 50;
  const adminBoxY = currentY - 120;
  const boxWidth = 220;
  const boxHeight = 100;

  // Draw admin box
  signaturePage.drawRectangle({
    x: adminBoxX,
    y: adminBoxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  signaturePage.drawText(toAsciiSafe('SEMNATURA ADMINISTRATOR'), {
    x: adminBoxX + 5,
    y: adminBoxY + boxHeight + 5,
    size: 11,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  signaturePage.drawText(toAsciiSafe('>>> SEMNATI AICI <<<'), {
    x: adminBoxX + 35,
    y: adminBoxY + boxHeight / 2,
    size: 12,
    font: timesRomanBold,
    color: rgb(0.7, 0, 0),
  });

  // Client signature box
  const clientBoxX = width - 270;
  const clientBoxY = adminBoxY;

  signaturePage.drawRectangle({
    x: clientBoxX,
    y: clientBoxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  signaturePage.drawText(toAsciiSafe('SEMNATURA CLIENT'), {
    x: clientBoxX + 5,
    y: clientBoxY + boxHeight + 5,
    size: 11,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  signaturePage.drawText(toAsciiSafe('>>> SEMNATI AICI <<<'), {
    x: clientBoxX + 35,
    y: clientBoxY + boxHeight / 2,
    size: 12,
    font: timesRomanBold,
    color: rgb(0.7, 0, 0),
  });

  // Footer note
  currentY = clientBoxY - 30;
  signaturePage.drawText(toAsciiSafe('NOTA: Casutele de mai sus sunt zone vizuale. Adobe Reader va permite adaugarea semnaturilor digitale.'), {
    x: 50,
    y: currentY,
    size: 8,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Return modified PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Check if PDF contains digital signature
 */
export async function checkPDFHasSignature(pdfBytes: Uint8Array): Promise<boolean> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Check if form exists and has any fields
    if (!form) return false;

    // Try to get signature fields
    const fields = form.getFields();
    const hasSignature = fields.some(field => {
      // Check if field type indicates signature
      const fieldType = field.constructor.name;
      return fieldType.includes('Signature') || fieldType.includes('PDFSignature');
    });

    return hasSignature;
  } catch (error) {
    console.error('Error checking PDF signature:', error);
    return false;
  }
}

/**
 * Verify uploaded PDF is valid and reasonable size
 */
export async function verifyUploadedPDF(
  file: File,
  maxSizeMB: number = 10
): Promise<{ valid: boolean; error?: string }> {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Fișierul trebuie să fie PDF' };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return { valid: false, error: `Fișierul este prea mare (max ${maxSizeMB}MB)` };
  }

  if (fileSizeMB < 0.01) {
    return { valid: false, error: 'Fișierul este prea mic sau corupt' };
  }

  // Try to load PDF
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    await PDFDocument.load(pdfBytes);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Fișier PDF invalid sau corupt' };
  }
}
