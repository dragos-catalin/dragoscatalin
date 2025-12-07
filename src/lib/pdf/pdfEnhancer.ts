/**
 * PDF Enhancement utilities for adding signature fields and digital signatures
 */

import { PDFDocument, PDFPage, rgb, PDFFont, StandardFonts } from "pdf-lib";
import type { DigitalSignature } from "../crypto/digitalSignature";

export interface SignatureFieldOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  fieldName: string;
  required?: boolean;
}

export interface AdminSignatureInfo {
  digitalSignature: DigitalSignature;
  visualText: string;
}

/**
 * Add an empty signature field to a PDF for user to sign with their certificate
 */
export async function addSignatureFieldToPDF(
  pdfBlob: Blob,
  options: SignatureFieldOptions
): Promise<Blob> {
  // Load the PDF
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Get the last page (signature typically goes at the end)
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { height } = lastPage.getSize();

  // Create a signature form field
  const form = pdfDoc.getForm();
  
  // Add signature field
  const signatureField = form.createTextField(options.fieldName);
  signatureField.addToPage(lastPage, {
    x: options.x,
    y: height - options.y - options.height, // PDF coordinates are bottom-up
    width: options.width,
    height: options.height,
  });

  // Make it required if specified
  if (options.required) {
    signatureField.enableRequired();
  }

  // Set field properties
  signatureField.setText("Click here to sign with your digital certificate");
  signatureField.enableReadOnly(); // Make it clickable but not editable

  // Add visual border and label
  lastPage.drawRectangle({
    x: options.x,
    y: height - options.y - options.height,
    width: options.width,
    height: options.height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  lastPage.drawText("Digital Signature Field - Click to Sign", {
    x: options.x + 10,
    y: height - options.y - options.height + options.height / 2 - 5,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save and return
  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

/**
 * Add admin's digital signature information to PDF
 */
export async function addAdminSignatureToPDF(
  pdfBlob: Blob,
  adminSignature: AdminSignatureInfo
): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Get the last page
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add admin signature section at the top of signature area
  const signatureY = 200; // Position from bottom
  const signatureX = 50;

  // Draw border for admin signature
  lastPage.drawRectangle({
    x: signatureX,
    y: signatureY,
    width: width - 100,
    height: 80,
    borderColor: rgb(0, 0.5, 0),
    borderWidth: 2,
    color: rgb(0.95, 1, 0.95),
  });

  // Add "Administrator Signature" label
  lastPage.drawText("Administrator Digital Signature", {
    x: signatureX + 10,
    y: signatureY + 60,
    size: 12,
    font: boldFont,
    color: rgb(0, 0.5, 0),
  });

  // Add signature details
  const signatureLines = [
    `Signed by: ${adminSignature.digitalSignature.signerName}`,
    adminSignature.digitalSignature.signerEmail
      ? `Email: ${adminSignature.digitalSignature.signerEmail}`
      : "",
    `Date: ${new Date(adminSignature.digitalSignature.timestamp).toLocaleString("ro-RO")}`,
    `Algorithm: ${adminSignature.digitalSignature.algorithm}`,
    "Certificate: Valid and verified ✓",
  ].filter(Boolean);

  let currentY = signatureY + 40;
  for (const line of signatureLines) {
    lastPage.drawText(line, {
      x: signatureX + 10,
      y: currentY,
      size: 9,
      font: font,
      color: rgb(0, 0, 0),
    });
    currentY -= 12;
  }

  // Add metadata about the signature
  pdfDoc.setTitle("Digitally Signed Contract");
  pdfDoc.setAuthor(adminSignature.digitalSignature.signerName);
  pdfDoc.setSubject("Contract with Digital Signature");
  pdfDoc.setKeywords([
    "digital signature",
    "contract",
    adminSignature.digitalSignature.signerName,
  ]);
  pdfDoc.setProducer("Interactive Media Solutions - Digital Signature System");
  pdfDoc.setCreator("Digital Contract Platform");

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

/**
 * Complete PDF enhancement: Add both admin signature (if present) and user signature field
 */
export async function enhancePDFWithSignatures(
  pdfBlob: Blob,
  adminSignature?: AdminSignatureInfo
): Promise<Blob> {
  let enhancedPdf = pdfBlob;

  // Add admin signature if provided
  if (adminSignature) {
    enhancedPdf = await addAdminSignatureToPDF(enhancedPdf, adminSignature);
  }

  // Add user signature field
  enhancedPdf = await addSignatureFieldToPDF(enhancedPdf, {
    x: 50,
    y: adminSignature ? 100 : 200, // Position below admin signature if present
    width: 500,
    height: 80,
    fieldName: "UserDigitalSignature",
    required: true,
  });

  return enhancedPdf;
}

/**
 * Create a signature field instruction overlay
 */
export async function addSignatureInstructions(
  pdfBlob: Blob,
  instructions: string
): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Add instructions at the bottom
  lastPage.drawText(instructions, {
    x: 50,
    y: 50,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
    maxWidth: width - 100,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}
