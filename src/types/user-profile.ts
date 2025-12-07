/**
 * Type definitions for user profile/settings
 */

export interface UserProfile {
  id: string; // User UID
  
  // Personal Information
  name: string; // Full name
  email: string; // Email address
  phone?: string; // Phone number
  role?: string; // Role/capacity (Administrator, Director, etc.) - myselfAs
  
  // Company Information
  company: string; // Company/business name
  companyAddress?: string; // Company address
  companyCUI?: string; // Company CUI/tax ID
  companyRC?: string; // Company Trade Register number
  website?: string; // Company website
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

export type UserProfileFormData = Omit<UserProfile, "id" | "createdAt" | "updatedAt">;
