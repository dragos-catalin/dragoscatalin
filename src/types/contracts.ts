/**
 * Contract-specific types for electronic signature workflow
 */

export type SignatureMethod = "typed" | "drawn" | "uploaded";

export interface ClientSignature {
  method: SignatureMethod;
  value?: string; // Typed name or canvas data URL
  fileUrl?: string; // Uploaded PDF URL
  signedAt: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface AdminSignature {
  type: "simple" | "digital-certificate" | "cloud-service";
  signedBy: string;
  signedAt: number;
  certificateId?: string;
  signatureData?: string; // Encrypted signature or certificate data
  signatureMethod?: "typed" | "drawn"; // For simple signatures
}

export interface ContractSignatureResponse {
  id: string;
  linkId: string;
  type: "contract-signature";
  clientSignature: ClientSignature;
  adminSignature?: AdminSignature;
  contractHtml: string; // Snapshot of signed contract
  contractHash?: string; // Hash for integrity verification
  pdfUrl?: string; // Generated PDF URL
  submittedAt: number;
  status: "pending" | "signed" | "completed";
}

export interface ContractPlaceholderValue {
  placeholder: string; // e.g., "clientName"
  value: string;
  category: "client" | "project" | "contract" | "personal" | "system" | "other";
  required?: boolean;
}

export type PlaceholderCategory = "client" | "project" | "contract" | "personal" | "system" | "other";

export interface ContractLinkData {
  templateId: string;
  contractData: Record<string, string>; // Filled placeholders
  contractHtml?: string; // Pre-rendered HTML snapshot
  contractHash?: string; // Hash of contract content
  requiresAdminSignature?: boolean;
  requiresClientSignature?: boolean;
  adminSignature?: AdminSignature;
  clientSignature?: ClientSignature; // Client's signature
  signatureDeadline?: number;
  contractCode?: string; // Unique contract identifier
  linkName?: string; // Display name for the contract
  clauses?: string[]; // Contract clauses/terms
  pdfUrl?: string; // Signed contract PDF URL
}
