"use client";

import { useState } from "react";
import { FormField, TemplateLanguage } from "@/types/templates";
import RichTextEditor from "@/components/RichTextEditor";

interface DynamicFormRendererProps {
  fields: FormField[];
  language: TemplateLanguage;
  introText?: string;
  preFillData?: Record<string, any>; // Pre-filled values (makes fields read-only)
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting?: boolean;
}

export default function DynamicFormRenderer({
  fields,
  language,
  introText,
  preFillData = {},
  onSubmit,
  isSubmitting = false,
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(preFillData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const handleChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    sortedFields.forEach((field) => {
      const value = formData[field.name];

      // Required validation
      if (field.required && (!value || (typeof value === "string" && !value.trim()))) {
        newErrors[field.name] = language === "en" ? "This field is required" : "Acest câmp este obligatoriu";
        return;
      }

      // Email validation
      if (field.type === "email" && value && typeof value === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = language === "en" ? "Invalid email address" : "Adresă de email invalidă";
        }
      }

      // Phone validation
      if (field.type === "tel" && value && typeof value === "string") {
        const phoneRegex = /^[+]?[\d\s\-()]+$/;
        if (!phoneRegex.test(value)) {
          newErrors[field.name] = language === "en" ? "Invalid phone number" : "Număr de telefon invalid";
        }
      }

      // Length validation
      if (field.validation?.minLength && value && typeof value === "string") {
        if (value.length < field.validation.minLength) {
          newErrors[field.name] = language === "en" 
            ? `Minimum ${field.validation.minLength} characters required`
            : `Minim ${field.validation.minLength} caractere necesare`;
        }
      }

      if (field.validation?.maxLength && value && typeof value === "string") {
        if (value.length > field.validation.maxLength) {
          newErrors[field.name] = language === "en"
            ? `Maximum ${field.validation.maxLength} characters allowed`
            : `Maxim ${field.validation.maxLength} caractere permise`;
        }
      }

      // Number validation
      if (field.type === "number" && value !== undefined && value !== "") {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[field.name] = language === "en" ? "Must be a number" : "Trebuie să fie un număr";
        } else {
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            newErrors[field.name] = language === "en"
              ? `Minimum value is ${field.validation.min}`
              : `Valoarea minimă este ${field.validation.min}`;
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            newErrors[field.name] = language === "en"
              ? `Maximum value is ${field.validation.max}`
              : `Valoarea maximă este ${field.validation.max}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const label = field.label?.[language] || field.name;
    const placeholder = field.placeholder?.[language];
    const description = field.description?.[language];
    const value = (formData && formData[field.name]) || "";
    const error = errors?.[field.name];
    const isPreFilled = preFillData && field.name in preFillData;

    const commonClasses = `w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isPreFilled ? 'opacity-60 cursor-not-allowed' : ''}`;
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";

    switch (field.type) {
      case "richtext":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
              {isPreFilled && <span className="text-blue-400 ml-2 text-xs">(Pre-completat)</span>}
            </label>
            {description && <p className="text-sm text-neutral-400">{description}</p>}
            <div className={isPreFilled ? 'opacity-60 pointer-events-none' : ''}>
              <RichTextEditor
                value={(value as string) || ""}
                onChange={(content) => handleChange(field.name, content)}
                placeholder={placeholder || "Introdu conținut..."}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
              {isPreFilled && <span className="text-blue-400 ml-2 text-xs">(Pre-completat)</span>}
            </label>
            {description && <p className="text-sm text-neutral-400">{description}</p>}
            <textarea
              name={field.name}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={placeholder}
              required={field.required}
              disabled={isPreFilled}
              rows={4}
              className={`${commonClasses} ${errorClasses}`}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
              {isPreFilled && <span className="text-blue-400 ml-2 text-xs">(Pre-completat)</span>}
            </label>
            {description && <p className="text-sm text-neutral-400">{description}</p>}
            <select
              name={field.name}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              disabled={isPreFilled}
              className={`${commonClasses} ${errorClasses}`}
            >
              <option value="">
                {language === "en" ? "-- Select an option --" : "-- Selectează o opțiune --"}
              </option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label[language]}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
              {isPreFilled && <span className="text-blue-400 ml-2 text-xs">(Pre-completat)</span>}
            </label>
            {description && <p className="text-sm text-neutral-400">{description}</p>}
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    disabled={isPreFilled}
                    className="w-4 h-4 text-blue-600 border-neutral-700 bg-neutral-800 focus:ring-blue-500"
                  />
                  {option.label[language]}
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
              {isPreFilled && <span className="text-blue-400 ml-2 text-xs">(Pre-completat)</span>}
            </label>
            {description && <p className="text-sm text-neutral-400">{description}</p>}
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    name={field.name}
                    value={option.value}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    disabled={isPreFilled}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v) => v !== option.value);
                      handleChange(field.name, newValues);
                    }}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-blue-500"
                  />
                  {option.label[language]}
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        );

      default:
        // text, email, tel, number, date
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
              {isPreFilled && <span className="text-blue-400 ml-2 text-xs">(Pre-completat)</span>}
            </label>
            {description && <p className="text-sm text-neutral-400">{description}</p>}
            <input
              type={field.type}
              name={field.name}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={placeholder}
              required={field.required}
              disabled={isPreFilled}
              min={field.validation?.min}
              max={field.validation?.max}
              className={`${commonClasses} ${errorClasses}`}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {introText && (
        <div 
          className="prose prose-invert max-w-none text-neutral-300 prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-strong:text-neutral-100 prose-ul:text-neutral-300 prose-ol:text-neutral-300"
          dangerouslySetInnerHTML={{ 
            __html: introText.replace(/\{\{[^}]+\}\}/g, '').trim() 
          }}
        />
      )}

      {sortedFields.map((field) => renderField(field))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {isSubmitting
          ? language === "en"
            ? "Submitting..."
            : "Se trimite..."
          : language === "en"
          ? "Submit"
          : "Trimite"}
      </button>
    </form>
  );
}
