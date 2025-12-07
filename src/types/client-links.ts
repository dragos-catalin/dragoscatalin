/**
 * Type definitions for client links and form responses
 */

import { ContractLinkData } from "./contracts";

export type FormType = "project-intake" | "discovery" | "contract-data" | "contract" | "contract-signature";
export type LinkStatus = "pending" | "completed" | "expired";

export interface ClientLink {
  id: string;
  name: string; // Internal name for the link
  type: FormType;
  templateId?: string; // Reference to template for dynamic forms
  preFillData?: Record<string, any>; // Pre-filled field values (read-only for clients)
  clientFieldMapping?: Record<string, string>; // Maps form field names to client field names
  clientId?: string; // Reference to client document
  clientName?: string; // Denormalized for quick access
  clientEmail?: string; // Denormalized for quick access
  note?: string;
  expiresInDays?: number; // Number of days until expiration (null = no expiration)
  expiresAt?: number; // Calculated expiration timestamp
  createdAt: number;
  createdBy: string | null;
  status: LinkStatus;
  completedAt?: number;
  accessPassword?: string; // Password to access completed/signed contract
  
  // Contract-specific fields
  contractData?: ContractLinkData;
}

export interface FormResponse {
  id: string;
  linkId: string;
  type: FormType;
  templateId?: string; // Template ID for the form/contract
  answers?: Record<string, unknown>; // Optional - only for form submissions
  submittedAt: number;
  // Contract signature fields (optional - only for contract-signature type)
  clientSignature?: {
    method: "typed" | "drawn" | "uploaded";
    value?: string;
    fileUrl?: string;
    signedAt: number;
    ipAddress?: string;
    userAgent?: string;
  };
  contractHtml?: string;
  contractHash?: string;
  status?: string;
  pdfUrl?: string; // Generated PDF download URL
}

// Specific form data types
export interface ProjectIntakeData {
  businessName: string;
  currentWebsite?: string;
  projectDescription: string;
  estimatedBudget: string;
  desiredTimeline: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface DiscoveryData {
  mainObjective: string;
  problemsToSolve: string;
  existingMaterials: string;
  targetAudience?: string;
  competitors?: string;
  contactEmail: string;
}

export interface ContractData {
  companyName: string;
  cui: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  contactPersonName: string;
  contactEmail: string;
  billingEmail?: string;
  phone: string;
}
