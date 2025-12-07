/**
 * Template system types for managing reusable content
 */

export type TemplateType = "form" | "contract" | "email";
export type TemplateLanguage = "en" | "ro";
export type TemplateStatus = "draft" | "active" | "archived";
export type FieldType = "text" | "email" | "tel" | "textarea" | "richtext" | "select" | "checkbox" | "radio" | "number" | "date";

export interface FormFieldOption {
  value: string;
  label: {
    en: string;
    ro: string;
  };
}

export interface FormField {
  id: string;
  name: string;
  label: {
    en: string;
    ro: string;
  };
  type: FieldType;
  required: boolean;
  placeholder?: {
    en: string;
    ro: string;
  };
  description?: {
    en: string;
    ro: string;
  };
  options?: FormFieldOption[]; // For select, radio, checkbox
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  order: number;
}

export interface Template {
  id: string;
  type: TemplateType;
  name: string;
  language: TemplateLanguage;
  status: TemplateStatus;
  description?: string;
  content: string; // Text content with {{placeholder}} and {{field:type:name}} tokens
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface TemplatePlaceholder {
  token: string;
  label: string;
  category: "client" | "project" | "contract" | "system" | "personal" | "field";
  example: string;
  description?: string;
}

// Available placeholders for templates
export const TEMPLATE_PLACEHOLDERS: TemplatePlaceholder[] = [
  // Client Information
  { token: "{{clientName}}", label: "Client Name", category: "client", example: "Ion Popescu" },
  { token: "{{clientEmail}}", label: "Client Email", category: "client", example: "ion@example.com" },
  { token: "{{clientPhone}}", label: "Client Phone", category: "client", example: "+40 123 456 789" },
  { token: "{{clientCompany}}", label: "Client Company", category: "client", example: "Example SRL" },
  { token: "{{clientCUI}}", label: "Client CUI", category: "client", example: "RO12345678" },
  { token: "{{clientRC}}", label: "Client RC (Trade Register)", category: "client", example: "J40/1234/2024" },
  { token: "{{clientAs}}", label: "Representative Role", category: "client", example: "Administrator" },
  { token: "{{clientAddress}}", label: "Client Address", category: "client", example: "Str. Exemplu nr. 1" },

  // Project Details
  { token: "{{projectName}}", label: "Project Name", category: "project", example: "Website Redesign" },
  { token: "{{projectDescription}}", label: "Project Description", category: "project", example: "Complete website overhaul with modern design" },
  { token: "{{projectBudget}}", label: "Project Budget", category: "project", example: "5000 EUR" },
  { token: "{{projectTimeline}}", label: "Project Timeline", category: "project", example: "2 months" },
  { token: "{{projectStartDate}}", label: "Start Date", category: "project", example: "01.01.2025" },
  { token: "{{projectEndDate}}", label: "End Date", category: "project", example: "28.02.2025" },

  // Contract/Financial
  { token: "{{contractDate}}", label: "Contract Date", category: "contract", example: "15.12.2024" },
  { token: "{{totalAmount}}", label: "Total Amount", category: "contract", example: "5000 EUR" },
  { token: "{{currency}}", label: "Currency", category: "contract", example: "EUR" },
  { token: "{{paymentTerms}}", label: "Payment Terms", category: "contract", example: "50% upfront, 50% on delivery" },
  { token: "{{invoiceNumber}}", label: "Invoice Number", category: "contract", example: "INV-2024-001" },

  // Personal Information
  { token: "{{myName}}", label: "Your Name", category: "personal", example: "Dragos Catalin" },
  { token: "{{myselfAs}}", label: "Your Role/Capacity", category: "personal", example: "Administrator" },
  { token: "{{myCompany}}", label: "Your Company", category: "personal", example: "Dragos Development SRL" },
  { token: "{{myCompanyAddress}}", label: "Your Company Address", category: "personal", example: "Str. Exemplu nr. 123, București" },
  { token: "{{myCompanyCUI}}", label: "Your Company CUI", category: "personal", example: "RO12345678" },
  { token: "{{myCompanyRC}}", label: "Your Company RC", category: "personal", example: "J40/1234/2024" },
  { token: "{{myEmail}}", label: "Your Email", category: "personal", example: "contact@dragoscatalin.ro" },
  { token: "{{myPhone}}", label: "Your Phone", category: "personal", example: "+40 xxx xxx xxx" },
  { token: "{{myWebsite}}", label: "Your Website", category: "personal", example: "dragoscatalin.ro" },

  // System
  { token: "{{todayDate}}", label: "Today's Date", category: "system", example: new Date().toLocaleDateString("ro-RO") },
  { token: "{{currentYear}}", label: "Current Year", category: "system", example: new Date().getFullYear().toString() },

  // Form Fields (for form-type templates - these render as actual input fields)
  { token: "{{input:fieldName*}}", label: "Text Input (required)", category: "field", example: "{{input:clientName*}}", description: "* marks required field" },
  { token: "{{input:fieldName}}", label: "Text Input (optional)", category: "field", example: "{{input:companyWebsite}}" },
  { token: "{{email:fieldName*}}", label: "Email Input", category: "field", example: "{{email:contactEmail*}}" },
  { token: "{{tel:fieldName}}", label: "Phone Input", category: "field", example: "{{tel:phoneNumber}}" },
  { token: "{{textarea:fieldName*}}", label: "Textarea", category: "field", example: "{{textarea:projectDescription*}}" },
  { token: "{{richtext:fieldName*}}", label: "Rich Text Editor", category: "field", example: "{{richtext:contractTerms*}}", description: "HTML editor with formatting" },
  { token: "{{number:fieldName}}", label: "Number Input", category: "field", example: "{{number:budget}}" },
  { token: "{{date:fieldName}}", label: "Date Input", category: "field", example: "{{date:deadline}}" },
  { token: "{{select:name|opt1,opt2}}", label: "Select Dropdown", category: "field", example: "{{select:budget|1000-3000,3000-5000,5000+}}" },
  { token: "{{checkbox:name*|Label}}", label: "Checkbox", category: "field", example: "{{checkbox:agreeTerms*|I agree to the terms}}" },
];

// Helper function to replace placeholders with actual values
export function replacePlaceholders(
  template: string,
  data: Record<string, string>
): string {
  let result = template;

  // Replace all placeholders with provided data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(value);
  });

  return result;
}

// Helper to get sample data for preview
export function getSampleData(): Record<string, string> {
  const sampleData: Record<string, string> = {};

  TEMPLATE_PLACEHOLDERS.forEach((placeholder) => {
    const key = placeholder.token.replace(/[{}]/g, "");
    sampleData[key] = placeholder.example;
  });

  return sampleData;
}

/**
 * Parse field placeholders from template content and convert to FormField objects
 * Syntax: {{type:fieldName*}} where * indicates required
 * Examples:
 * - {{input:clientName*}} - required text input
 * - {{email:contactEmail}} - optional email input
 * - {{textarea:description*}} - required textarea
 * - {{select:budget|1000-3000,3000-5000,5000+}} - select with options
 * - {{checkbox:agree*|I agree to terms}} - required checkbox with label
 */
export function parseFieldPlaceholders(content: string, language: TemplateLanguage = "ro"): FormField[] {
  const fields: FormField[] = [];
  const fieldRegex = /\{\{(input|email|tel|textarea|richtext|number|date|select|checkbox):([^}]+)\}\}/g;
  let match;
  let order = 0;

  while ((match = fieldRegex.exec(content)) !== null) {
    const fieldType = match[1] as FieldType;
    const fieldConfig = match[2];

    // Parse field name and check if required
    let fieldName = fieldConfig;
    let required = false;
    let options: FormFieldOption[] | undefined;
    let checkboxLabel: string | undefined;

    // Handle select: fieldName|option1,option2,option3
    if (fieldType === "select" && fieldConfig.includes("|")) {
      const [name, optionsStr] = fieldConfig.split("|");
      fieldName = name.trim();
      required = fieldName.endsWith("*");
      fieldName = fieldName.replace("*", "");

      options = optionsStr.split(",").map((opt) => ({
        value: opt.trim(),
        label: { en: opt.trim(), ro: opt.trim() },
      }));
    }
    // Handle checkbox: fieldName*|Label text
    else if (fieldType === "checkbox" && fieldConfig.includes("|")) {
      const [name, label] = fieldConfig.split("|");
      fieldName = name.trim();
      required = fieldName.endsWith("*");
      fieldName = fieldName.replace("*", "");
      checkboxLabel = label.trim();
    }
    // Handle other types
    else {
      required = fieldName.endsWith("*");
      fieldName = fieldName.replace("*", "").trim();
    }

    // Generate label from field name (camelCase to Title Case)
    const generateLabel = (name: string): string => {
      return name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    };

    const field: FormField = {
      id: `field_${fieldName}_${order}`,
      name: fieldName,
      label: {
        en: checkboxLabel || generateLabel(fieldName),
        ro: checkboxLabel || generateLabel(fieldName),
      },
      type: fieldType === "checkbox" ? "checkbox" : fieldType === "select" ? "select" : fieldType,
      required,
      order,
    };

    if (options) {
      field.options = options;
    }

    fields.push(field);
    order++;
  }

  return fields;
}

/**
 * Render template content with field placeholders replaced by actual form inputs
 * Returns an array of content segments and field objects for rendering
 */
export function parseTemplateForRendering(content: string, language: TemplateLanguage = "ro"): Array<{ type: "text" | "field"; content?: string; field?: FormField }> {
  const segments: Array<{ type: "text" | "field"; content?: string; field?: FormField }> = [];
  const fieldRegex = /\{\{(input|email|tel|textarea|richtext|number|date|select|checkbox):([^}]+)\}\}/g;

  let lastIndex = 0;
  let match;
  let order = 0;

  while ((match = fieldRegex.exec(content)) !== null) {
    // Add text before this field
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      });
    }

    const fieldType = match[1] as FieldType;
    const fieldConfig = match[2];

    let fieldName = fieldConfig;
    let required = false;
    let options: FormFieldOption[] | undefined;
    let checkboxLabel: string | undefined;

    if (fieldType === "select" && fieldConfig.includes("|")) {
      const [name, optionsStr] = fieldConfig.split("|");
      fieldName = name.trim();
      required = fieldName.endsWith("*");
      fieldName = fieldName.replace("*", "");

      options = optionsStr.split(",").map((opt) => ({
        value: opt.trim(),
        label: { en: opt.trim(), ro: opt.trim() },
      }));
    } else if (fieldType === "checkbox" && fieldConfig.includes("|")) {
      const [name, label] = fieldConfig.split("|");
      fieldName = name.trim();
      required = fieldName.endsWith("*");
      fieldName = fieldName.replace("*", "");
      checkboxLabel = label.trim();
    } else {
      required = fieldName.endsWith("*");
      fieldName = fieldName.replace("*", "").trim();
    }

    const generateLabel = (name: string): string => {
      return name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    };

    const field: FormField = {
      id: `field_${fieldName}_${order}`,
      name: fieldName,
      label: {
        en: checkboxLabel || generateLabel(fieldName),
        ro: checkboxLabel || generateLabel(fieldName),
      },
      type: fieldType === "checkbox" ? "checkbox" : fieldType === "select" ? "select" : fieldType,
      required,
      order,
    };

    if (options) {
      field.options = options;
    }

    segments.push({
      type: "field",
      field,
    });

    lastIndex = match.index + match[0].length;
    order++;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      content: content.substring(lastIndex),
    });
  }

  return segments;
}
