/**
 * PDF generation utilities for contracts
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generate PDF from HTML contract content
 */
export async function generateContractPDF(
  contractHtml: string,
  contractName: string = "contract"
): Promise<Blob> {
  // Create a temporary div to render HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = contractHtml;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.width = "210mm"; // A4 width
  tempDiv.style.padding = "20mm";
  tempDiv.style.backgroundColor = "white";
  tempDiv.style.color = "black";
  tempDiv.style.fontFamily = "Arial, sans-serif";
  tempDiv.style.fontSize = "12pt";
  tempDiv.style.lineHeight = "1.6";
  
  document.body.appendChild(tempDiv);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit page
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Return PDF as blob
    return pdf.output("blob");
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
}

/**
 * Download PDF file
 */
export function downloadPDF(blob: Blob, filename: string = "contract.pdf") {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download contract PDF
 */
export async function generateAndDownloadContractPDF(
  contractHtml: string,
  contractName: string = "contract"
): Promise<void> {
  const pdfBlob = await generateContractPDF(contractHtml, contractName);
  downloadPDF(pdfBlob, `${contractName}.pdf`);
}

/**
 * Add signature to contract HTML
 */
export function addSignatureToContract(
  contractHtml: string,
  signatureType: "typed" | "drawn",
  signatureValue: string,
  signerName: string,
  signatureDate: Date = new Date()
): string {
  const signatureHtml = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 20px;">Semnături</h3>
      <div style="margin-bottom: 30px;">
        <p style="margin: 5px 0;"><strong>${signerName}</strong></p>
        ${signatureType === "drawn" 
          ? `<img src="${signatureValue}" style="max-width: 300px; height: auto; border-bottom: 1px solid #000; padding-bottom: 5px;" alt="Signature" />`
          : `<p style="font-family: 'Brush Script MT', cursive; font-size: 24pt; margin: 10px 0; border-bottom: 1px solid #000; padding-bottom: 5px; display: inline-block; min-width: 300px;">${signatureValue}</p>`
        }
        <p style="margin: 5px 0; font-size: 10pt; color: #666;">
          Semnat electronic pe: ${signatureDate.toLocaleDateString("ro-RO", { 
            day: "2-digit", 
            month: "long", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>
    </div>
  `;

  // Insert signature before closing body tag, or append to end
  if (contractHtml.includes("</body>")) {
    return contractHtml.replace("</body>", signatureHtml + "</body>");
  } else {
    return contractHtml + signatureHtml;
  }
}
