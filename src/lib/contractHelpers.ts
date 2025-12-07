/**
 * Helper functions for contract placeholder management
 */

import { PlaceholderCategory } from "@/types/contracts";
import { TEMPLATE_PLACEHOLDERS } from "@/types/templates";
import { UserProfile } from "@/types/user-profile";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

/**
 * Extract all placeholders from template content
 * Returns unique list of placeholder names (without {{ }})
 * Includes both simple placeholders {{name}} and field placeholders {{type:name}}
 */
export function extractPlaceholders(templateContent: string): string[] {
  const placeholders = new Set<string>();
  
  // Match simple placeholders: {{placeholder}}
  const simpleRegex = /\{\{([^}:]+)\}\}/g;
  const simpleMatches = Array.from(templateContent.matchAll(simpleRegex));
  simpleMatches.forEach(m => {
    const placeholder = m[1].trim();
    // Only add if it's not part of a field placeholder
    if (!templateContent.includes(`{{${placeholder}:`)) {
      placeholders.add(placeholder);
    }
  });
  
  // Match field-type placeholders: {{type:fieldName}} or {{type:fieldName*}}
  const fieldRegex = /\{\{(input|email|tel|textarea|number|date|select|checkbox):([^}*]+)\*?\}\}/g;
  const fieldMatches = Array.from(templateContent.matchAll(fieldRegex));
  fieldMatches.forEach(m => {
    const fieldType = m[1];
    let fieldName = m[2].trim();
    
    // Handle select and checkbox special syntax
    if ((fieldType === 'select' || fieldType === 'checkbox') && fieldName.includes('|')) {
      fieldName = fieldName.split('|')[0].trim();
    }
    
    placeholders.add(fieldName);
  });
  
  return Array.from(placeholders).sort();
}

/**
 * Categorize a placeholder by its name
 */
export function categorizePlaceholder(placeholder: string): PlaceholderCategory {
  const lower = placeholder.toLowerCase();
  
  if (lower.startsWith('client')) return 'client';
  if (lower.startsWith('project')) return 'project';
  if (lower.startsWith('my')) return 'personal';
  if (lower === 'todaydate' || lower === 'currentyear') return 'system';
  if (
    lower.startsWith('contract') || 
    lower.includes('amount') || 
    lower.includes('payment') ||
    lower === 'currency' ||
    lower === 'invoice'
  ) return 'contract';
  
  return 'other';
}

/**
 * Get display label for a placeholder
 */
export function getPlaceholderLabel(placeholder: string): string {
  // Try to find in TEMPLATE_PLACEHOLDERS
  const found = TEMPLATE_PLACEHOLDERS.find(p => 
    p.token === `{{${placeholder}}}`
  );
  
  if (found) {
    return found.label;
  }
  
  // Generate label from camelCase/PascalCase
  return placeholder
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Get example value for a placeholder
 */
export function getPlaceholderExample(placeholder: string): string {
  const found = TEMPLATE_PLACEHOLDERS.find(p => 
    p.token === `{{${placeholder}}}`
  );
  
  return found?.example || '';
}

/**
 * Check if a placeholder should be required
 */
export function isPlaceholderRequired(placeholder: string): boolean {
  const category = categorizePlaceholder(placeholder);
  
  // Client and contract placeholders are typically required
  if (category === 'client' || category === 'contract') {
    // Exception: some client fields may be optional
    const optionalClientFields = ['clientPhone', 'clientAddress', 'clientCUI'];
    if (optionalClientFields.includes(placeholder)) {
      return false;
    }
    return true;
  }
  
  return false;
}

/**
 * Get auto-filled value for system placeholders
 */
export function getSystemPlaceholderValue(placeholder: string): string | null {
  switch (placeholder) {
    case 'todayDate':
      return new Date().toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    case 'currentYear':
      return new Date().getFullYear().toString();
    default:
      return null;
  }
}

/**
 * Fetch user profile and get personal placeholder values
 */
export async function getPersonalPlaceholderValues(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};

  try {
    const docRef = doc(db, "userProfiles", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return {};

    const profile = docSnap.data() as UserProfile;
    
    return {
      myName: profile.name || '',
      myselfAs: profile.role || '',
      myEmail: profile.email || '',
      myPhone: profile.phone || '',
      myCompany: profile.company || '',
      myCompanyAddress: profile.companyAddress || '',
      myCompanyCUI: profile.companyCUI || '',
      myCompanyRC: profile.companyRC || '',
      myWebsite: profile.website || '',
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {};
  }
}

/**
 * Replace all placeholders in template content with provided values
 */
export function replacePlaceholdersInContract(
  templateContent: string,
  values: Record<string, string>
): string {
  let result = templateContent;
  
  // Replace each placeholder
  Object.entries(values).forEach(([key, value]) => {
    // Replace simple placeholder: {{key}}
    const simplePlaceholder = `{{${key}}}`;
    result = result.split(simplePlaceholder).join(value);
    
    // Replace field-type placeholders: {{type:key}} or {{type:key*}}
    const fieldTypes = ['input', 'email', 'tel', 'textarea', 'number', 'date', 'select', 'checkbox'];
    fieldTypes.forEach(type => {
      // Pattern without asterisk
      const fieldPlaceholder = `{{${type}:${key}}}`;
      result = result.split(fieldPlaceholder).join(value);
      
      // Pattern with asterisk (required field marker)
      const fieldPlaceholderRequired = `{{${type}:${key}*}}`;
      result = result.split(fieldPlaceholderRequired).join(value);
      
      // Handle select/checkbox with options (e.g., {{select:budget|opt1,opt2}})
      const optionsRegex = new RegExp(`\\{\\{${type}:${key}\\*?\\|[^}]+\\}\\}`, 'g');
      result = result.replace(optionsRegex, value);
    });
  });
  
  return result;
}

/**
 * Generate a hash of contract content for integrity verification
 */
export async function generateContractHash(content: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return Buffer.from(content).toString('base64').substring(0, 32);
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Group placeholders by category
 */
export function groupPlaceholdersByCategory(placeholders: string[]): Record<PlaceholderCategory, string[]> {
  const groups: Record<PlaceholderCategory, string[]> = {
    client: [],
    project: [],
    contract: [],
    personal: [],
    system: [],
    other: []
  };
  
  placeholders.forEach(placeholder => {
    const category = categorizePlaceholder(placeholder);
    groups[category].push(placeholder);
  });
  
  return groups;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: PlaceholderCategory): string {
  const names: Record<PlaceholderCategory, string> = {
    client: 'Date Client',
    project: 'Detalii Proiect',
    contract: 'Detalii Contract',
    personal: 'Datele Tale',
    system: 'Sistem (Auto-completat)',
    other: 'Alte Date'
  };
  
  return names[category];
}
