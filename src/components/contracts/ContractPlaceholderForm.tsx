/**
 * Form for filling contract placeholders when creating a contract link
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  extractPlaceholders, 
  groupPlaceholdersByCategory,
  getCategoryDisplayName,
  getPlaceholderLabel,
  getPlaceholderExample,
  isPlaceholderRequired,
  getSystemPlaceholderValue,
  getPersonalPlaceholderValues
} from "@/lib/contractHelpers";
import { PlaceholderCategory } from "@/types/contracts";
import { Client } from "@/types/clients";
import { parseFieldPlaceholders, FormField } from "@/types/templates";
import RichTextEditor from "@/components/RichTextEditor";

interface ContractPlaceholderFormProps {
  templateContent: string;
  selectedClient?: Client;
  onChange: (placeholderValues: Record<string, string>) => void;
  initialValues?: Record<string, string>;
}

export default function ContractPlaceholderForm({
  templateContent,
  selectedClient,
  onChange,
  initialValues = {}
}: ContractPlaceholderFormProps) {
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>(initialValues);
  const [missingRequired, setMissingRequired] = useState<string[]>([]);

  // Extract and group placeholders (memoized to prevent infinite loops)
  const allPlaceholders = useMemo(() => extractPlaceholders(templateContent), [templateContent]);
  
  // Parse field placeholders (richtext, textarea, input, etc.)
  const fieldPlaceholders = useMemo(() => parseFieldPlaceholders(templateContent, 'ro'), [templateContent]);
  
  // Filter out field placeholder names from standard placeholders to avoid duplicates
  const placeholders = useMemo(() => {
    const fieldNames = new Set(fieldPlaceholders.map(f => f.name));
    return allPlaceholders.filter(p => !fieldNames.has(p));
  }, [allPlaceholders, fieldPlaceholders]);
  
  const groupedPlaceholders = useMemo(() => groupPlaceholdersByCategory(placeholders), [placeholders]);

  // Auto-fill values when component mounts or dependencies change
  useEffect(() => {
    const loadAutoFillValues = async () => {
      const autoFilledValues: Record<string, string> = { ...placeholderValues };
      
      // Auto-fill client data if client is selected
      if (selectedClient) {
        const clientMappings: Record<string, keyof Client> = {
          clientName: 'name',
          clientEmail: 'email',
          clientPhone: 'phone',
          clientCompany: 'company',
          clientCUI: 'cui',
          clientRC: 'rc',
          clientAs: 'representativeRole',
          clientAddress: 'address'
        };
        
        Object.entries(clientMappings).forEach(([placeholder, clientField]) => {
          if (placeholders.includes(placeholder) && selectedClient[clientField]) {
            autoFilledValues[placeholder] = String(selectedClient[clientField]);
          }
        });
      }
      
      // Auto-fill system placeholders
      placeholders.forEach(placeholder => {
        const systemValue = getSystemPlaceholderValue(placeholder);
        if (systemValue) {
          autoFilledValues[placeholder] = systemValue;
        }
      });
      
      // Auto-fill personal placeholders from user profile
      const personalValues = await getPersonalPlaceholderValues();
      Object.entries(personalValues).forEach(([placeholder, value]) => {
        if (placeholders.includes(placeholder) && value) {
          autoFilledValues[placeholder] = value;
        }
      });
      
      setPlaceholderValues(autoFilledValues);
      onChange(autoFilledValues);
    };

    loadAutoFillValues();
  }, [templateContent, selectedClient?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate required fields
  useEffect(() => {
    const missing = placeholders.filter(p => 
      isPlaceholderRequired(p) && !placeholderValues[p]?.trim()
    );
    setMissingRequired(missing);
  }, [placeholderValues, placeholders]);

  const handleChange = (placeholder: string, value: string) => {
    const updated = { ...placeholderValues, [placeholder]: value };
    setPlaceholderValues(updated);
    onChange(updated);
  };

  if (placeholders.length === 0) {
    return (
      <div className="text-sm text-neutral-500 italic">
        Acest template nu conține placeholder-uri de completat.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {missingRequired.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-sm text-yellow-300">
          <strong>⚠️ Atenție:</strong> Există {missingRequired.length} câmpuri obligatorii necompletate.
        </div>
      )}

      {/* Standard Placeholders */}
      {(Object.keys(groupedPlaceholders) as PlaceholderCategory[]).map(category => {
        const categoryPlaceholders = groupedPlaceholders[category];
        if (categoryPlaceholders.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
              {getCategoryDisplayName(category)}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {categoryPlaceholders.map(placeholder => {
                const label = getPlaceholderLabel(placeholder);
                const example = getPlaceholderExample(placeholder);
                const required = isPlaceholderRequired(placeholder);
                const value = placeholderValues[placeholder] || '';
                const isSystemField = category === 'system';
                const isAutoFilled = isSystemField || (selectedClient && placeholder.startsWith('client'));

                return (
                  <div key={placeholder} className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      {label}
                      {required && <span className="text-red-400 ml-1">*</span>}
                      {isAutoFilled && <span className="text-blue-400 ml-2 text-xs">(Auto-completat)</span>}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleChange(placeholder, e.target.value)}
                      placeholder={example || `Ex: ${label}`}
                      disabled={isSystemField}
                      className={`w-full bg-neutral-900 border rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 ${
                        isSystemField ? 'opacity-60 cursor-not-allowed' : 'border-neutral-700'
                      } ${
                        required && !value ? 'border-yellow-500/50' : ''
                      }`}
                    />
                    {example && !isSystemField && (
                      <p className="text-xs text-neutral-500">Ex: {example}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Field Placeholders (richtext, textarea, etc.) */}
      {fieldPlaceholders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            Câmpuri dinamice
          </h3>

          <div className="space-y-4">
            {fieldPlaceholders.map((field) => {
              const value = placeholderValues[field.name] || '';
              const label = field.label['ro'];

              if (field.type === 'richtext') {
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      {label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <RichTextEditor
                      value={value}
                      onChange={(content) => handleChange(field.name, content)}
                      placeholder={`Introdu ${label.toLowerCase()}...`}
                    />
                  </div>
                );
              } else if (field.type === 'textarea') {
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      {label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <textarea
                      value={value}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      rows={4}
                      placeholder={`Introdu ${label.toLowerCase()}...`}
                      className={`w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 ${
                        field.required && !value ? 'border-yellow-500/50' : ''
                      }`}
                    />
                  </div>
                );
              } else if (field.type === 'select') {
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      {label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600 ${
                        field.required && !value ? 'border-yellow-500/50' : ''
                      }`}
                    >
                      <option value="">-- Selectează --</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label['ro']}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              } else {
                // Default: text, email, tel, number, date
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      {label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type}
                      value={value}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={`Introdu ${label.toLowerCase()}...`}
                      className={`w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 ${
                        field.required && !value ? 'border-yellow-500/50' : ''
                      }`}
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}

      <div className="text-xs text-neutral-600">
        * Câmpuri obligatorii
      </div>
    </div>
  );
}
