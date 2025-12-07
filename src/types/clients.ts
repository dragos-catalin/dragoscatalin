/**
 * Type definitions for client management
 */

export interface Client {
  id: string;
  name: string; // Company name or person name (required)
  email: string; // Contact email (required)
  phone?: string; // Contact phone number
  company?: string; // Company name (if name is a person)
  cui?: string; // Romanian tax ID (CUI/CIF)
  rc?: string; // Trade Register number (Registrul Comerțului)
  representativeRole?: string; // Role of the representative (Administrator, Director, etc.)
  address?: string; // Street address
  city?: string; // City
  county?: string; // County/Region
  postalCode?: string; // Postal/ZIP code
  notes?: string; // Additional notes about the client
  createdAt: number; // Timestamp when created
  updatedAt: number; // Timestamp when last updated
  createdBy: string | null; // User ID who created this client
}

export type ClientFormData = Omit<Client, "id" | "createdAt" | "updatedAt" | "createdBy">;
