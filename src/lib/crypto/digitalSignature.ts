/**
 * Digital signature utilities for certificate-based signing
 * Uses Web eID for smart card/USB token certificate access
 */

import * as webeid from '@web-eid/web-eid-library/web-eid';
import forge from 'node-forge';

export interface DigitalSignature {
  signature: string; // Base64 encoded signature from smart card
  certificate: string; // Base64 encoded X.509 certificate
  algorithm: string; // Signature algorithm used
  timestamp: string;
  signerName: string;
  signerEmail?: string;
  issuer: string; // Certificate issuer
  serialNumber: string; // Certificate serial number
  validFrom: string;
  validTo: string;
  signatureAlgorithm?: { // Web eID signature algorithm details
    cryptoAlgorithm: string;
    hashFunction: string;
    paddingScheme: string;
  };
}

export interface CertificateInfo {
  commonName: string;
  email?: string;
  organization?: string;
  organizationalUnit?: string;
  country?: string;
  issuer: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  isValid: boolean;
}

/**
 * Get signing certificate from smart card/USB token
 * This will show the native browser certificate selection dialog
 */
export async function getSigningCertificateFromSmartCard(language: string = 'en'): Promise<{
  certificate: string;
  certificateInfo: CertificateInfo;
  supportedAlgorithms: any[];
} | null> {
  try {
    // Check if Web eID is available
    const status = await webeid.status();
    if (!status) {
      throw new Error('Web eID not available. Please install from https://web-eid.eu/');
    }

    // Get certificate from smart card - this shows the native selection dialog!
    const result = await webeid.getSigningCertificate({ lang: language });

    // Parse certificate to extract info
    const certDer = forge.util.decode64(result.certificate);
    const certAsn1 = forge.asn1.fromDer(certDer);
    const certificate = forge.pki.certificateFromAsn1(certAsn1);

    const info = extractCertificateInfo(certificate);

    return {
      certificate: result.certificate,
      certificateInfo: info,
      supportedAlgorithms: result.supportedSignatureAlgorithms
    };
  } catch (error: any) {
    console.error('Error getting certificate from smart card:', error);

    // Handle specific Web eID errors
    if (error.code === 'ERR_WEBEID_USER_CANCELLED') {
      throw new Error('Ați anulat selecția certificatului');
    } else if (error.code === 'ERR_WEBEID_EXTENSION_UNAVAILABLE') {
      throw new Error('Extensia Web eID nu este instalată. Descărcați de la https://web-eid.eu/');
    } else if (error.code === 'ERR_WEBEID_NATIVE_UNAVAILABLE') {
      throw new Error('Aplicația Web eID nu este instalată. Descărcați de la https://web-eid.eu/');
    }

    return null;
  }
}

/**
 * Extract certificate information
 */
export function extractCertificateInfo(certificate: forge.pki.Certificate): CertificateInfo {
  const subject = certificate.subject.attributes;
  const issuer = certificate.issuer.attributes;

  const getAttr = (attrs: any[], oid: string) => {
    const attr = attrs.find(a => a.shortName === oid || a.name === oid);
    return attr?.value || '';
  };

  const now = new Date();
  const validFrom = certificate.validity.notBefore;
  const validTo = certificate.validity.notAfter;
  const isValid = now >= validFrom && now <= validTo;

  return {
    commonName: getAttr(subject, 'CN'),
    email: getAttr(subject, 'emailAddress') || getAttr(subject, 'E'),
    organization: getAttr(subject, 'O'),
    organizationalUnit: getAttr(subject, 'OU'),
    country: getAttr(subject, 'C'),
    issuer: getAttr(issuer, 'CN'),
    serialNumber: certificate.serialNumber,
    validFrom,
    validTo,
    isValid
  };
}

/**
 * Sign document hash using smart card/USB token
 */
export async function signWithSmartCard(
  certificate: string,
  data: ArrayBuffer,
  supportedAlgorithms: any[],
  language: string = 'en'
): Promise<DigitalSignature | null> {
  try {
    // Create SHA-256 hash of the data
    const md = forge.md.sha256.create();
    const bytes = new Uint8Array(data);
    let dataStr = '';
    for (let i = 0; i < bytes.length; i++) {
      dataStr += String.fromCharCode(bytes[i]);
    }
    md.update(dataStr, 'utf8');
    const hashBytes = md.digest().getBytes();
    const hash = forge.util.encode64(hashBytes);

    // Choose hash function (prefer SHA-256)
    const hashFunction = 'SHA-256';

    // Sign the hash using smart card - Web eID handles the PIN prompt
    const signResult = await webeid.sign(certificate, hash, hashFunction, { lang: language });

    // Parse certificate to extract info
    const certDer = forge.util.decode64(certificate);
    const certAsn1 = forge.asn1.fromDer(certDer);
    const cert = forge.pki.certificateFromAsn1(certAsn1);
    const certInfo = extractCertificateInfo(cert);

    return {
      signature: signResult.signature,
      certificate: certificate,
      algorithm: `${signResult.signatureAlgorithm.cryptoAlgorithm} with ${signResult.signatureAlgorithm.hashFunction}`,
      timestamp: new Date().toISOString(),
      signerName: certInfo.commonName,
      signerEmail: certInfo.email,
      issuer: certInfo.issuer,
      serialNumber: certInfo.serialNumber,
      validFrom: certInfo.validFrom.toISOString(),
      validTo: certInfo.validTo.toISOString(),
      signatureAlgorithm: signResult.signatureAlgorithm
    };
  } catch (error: any) {
    console.error('Error signing with smart card:', error);

    // Handle specific Web eID errors
    if (error.code === 'ERR_WEBEID_USER_CANCELLED') {
      throw new Error('Ați anulat semnarea');
    } else if (error.code === 'ERR_WEBEID_USER_TIMEOUT') {
      throw new Error('Timp expirat pentru introducerea PIN-ului');
    }

    return null;
  }
}

/**
 * Format certificate info for display
 */
export function formatCertificateInfo(signature: DigitalSignature): string {
  return `Digitally signed by: ${signature.signerName}
${signature.signerEmail ? `Email: ${signature.signerEmail}` : ""}
Issuer: ${signature.issuer}
Serial: ${signature.serialNumber}
Valid from: ${new Date(signature.validFrom).toLocaleString()}
Valid to: ${new Date(signature.validTo).toLocaleString()}
Date signed: ${new Date(signature.timestamp).toLocaleString()}
Algorithm: ${signature.algorithm}`;
}

/**
 * Check if Web eID is available
 */
export async function isWebEIDAvailable(): Promise<boolean> {
  try {
    const status = await webeid.status();
    return !!status;
  } catch {
    return false;
  }
}
