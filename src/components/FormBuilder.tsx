"use client";

import { useState } from "react";
import { FormField, FieldType, FormFieldOption } from "@/types/templates";

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  language: "en" | "ro";
}

const fieldTypeLabels: Record<FieldType, { en: string; ro: string }> = {
  text: { en: "Text", ro: "Text" },
  email: { en: "Email", ro: "Email" },
  tel: { en: "Phone", ro: "Telefon" },
  textarea: { en: "Textarea", ro: "Zonă text" },
  richtext: { en: "Rich Text", ro: "Text formatat" },
  select: { en: "Select", ro: "Selectare" },
  checkbox: { en: "Checkbox", ro: "Bifă" },
  radio: { en: "Radio", ro: "Radio" },
  number: { en: "Number", ro: "Număr" },
  date: { en: "Date", ro: "Dată" },
};

export default function FormBuilder({ fields, onChange, language }: FormBuilderProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showAddField, setShowAddField] = useState(false);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: "",
      label: { en: "", ro: "" },
      type: "text",
      required: false,
      order: fields.length,
    };
    onChange([...fields, newField]);
    setEditingField(newField.id);
    setShowAddField(false);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onChange(
      fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  const deleteField = (fieldId: string) => {
    onChange(fields.filter((f) => f.id !== fieldId).map((f, idx) => ({ ...f, order: idx })));
    setEditingField(null);
  };

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const index = fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    onChange(newFields.map((f, idx) => ({ ...f, order: idx })));
  };

  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newOption: FormFieldOption = {
      value: "",
      label: { en: "", ro: "" },
    };

    updateField(fieldId, {
      options: [...(field.options || []), newOption],
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, updates: Partial<FormFieldOption>) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
    updateField(fieldId, { options: newOptions });
  };

  const deleteOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    updateField(fieldId, {
      options: field.options.filter((_, idx) => idx !== optionIndex),
    });
  };

  const needsOptions = (type: FieldType) => ["select", "radio", "checkbox"].includes(type);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {language === "en" ? "Form Fields" : "Câmpuri formular"}
        </h3>
        <button
          type="button"
          onClick={addField}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {language === "en" ? "+ Add Field" : "+ Adaugă câmp"}
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-12 border border-dashed border-neutral-700 rounded-lg">
          <p className="text-neutral-400">
            {language === "en" ? "No fields yet. Click 'Add Field' to start." : "Niciun câmp încă. Apasă 'Adaugă câmp' pentru a începe."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-neutral-700 rounded-lg p-4 bg-neutral-900/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-neutral-400">#{index + 1}</span>
                <span className="text-white font-medium">
                  {field.label[language] || field.name || (language === "en" ? "(Unnamed field)" : "(Câmp fără nume)")}
                </span>
                <span className="text-xs text-neutral-500 px-2 py-1 bg-neutral-800 rounded">
                  {fieldTypeLabels[field.type][language]}
                </span>
                {field.required && (
                  <span className="text-xs text-red-400">*</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveField(field.id, "up")}
                  disabled={index === 0}
                  className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title={language === "en" ? "Move up" : "Mută în sus"}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveField(field.id, "down")}
                  disabled={index === fields.length - 1}
                  className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title={language === "en" ? "Move down" : "Mută în jos"}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                  className="px-2 py-1 text-sm text-blue-400 hover:text-blue-300"
                >
                  {editingField === field.id ? (language === "en" ? "Close" : "Închide") : (language === "en" ? "Edit" : "Editează")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(language === "en" ? "Delete this field?" : "Ștergi acest câmp?")) {
                      deleteField(field.id);
                    }
                  }}
                  className="px-2 py-1 text-sm text-red-400 hover:text-red-300"
                >
                  {language === "en" ? "Delete" : "Șterge"}
                </button>
              </div>
            </div>

            {editingField === field.id && (
              <div className="mt-4 space-y-4 pt-4 border-t border-neutral-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      {language === "en" ? "Field Name (internal)" : "Nume câmp (intern)"}
                    </label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., clientName"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      {language === "en" ? "Field Type" : "Tip câmp"}
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(fieldTypeLabels).map(([type, labels]) => (
                        <option key={type} value={type}>
                          {labels[language]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      {language === "en" ? "Label (English)" : "Etichetă (Engleză)"}
                    </label>
                    <input
                      type="text"
                      value={field.label.en}
                      onChange={(e) =>
                        updateField(field.id, {
                          label: { ...field.label, en: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      {language === "en" ? "Label (Romanian)" : "Etichetă (Română)"}
                    </label>
                    <input
                      type="text"
                      value={field.label.ro}
                      onChange={(e) =>
                        updateField(field.id, {
                          label: { ...field.label, ro: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      {language === "en" ? "Placeholder (English)" : "Placeholder (Engleză)"}
                    </label>
                    <input
                      type="text"
                      value={field.placeholder?.en || ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          placeholder: { ...field.placeholder, en: e.target.value, ro: field.placeholder?.ro || "" },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      {language === "en" ? "Placeholder (Romanian)" : "Placeholder (Română)"}
                    </label>
                    <input
                      type="text"
                      value={field.placeholder?.ro || ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          placeholder: { en: field.placeholder?.en || "", ro: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-blue-500"
                    />
                    {language === "en" ? "Required field" : "Câmp obligatoriu"}
                  </label>
                </div>

                {needsOptions(field.type) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-neutral-300">
                        {language === "en" ? "Options" : "Opțiuni"}
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(field.id)}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        {language === "en" ? "+ Add Option" : "+ Adaugă opțiune"}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {field.options?.map((option, optIdx) => (
                        <div key={optIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) =>
                              updateOption(field.id, optIdx, { value: e.target.value })
                            }
                            placeholder="value"
                            className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-sm"
                          />
                          <input
                            type="text"
                            value={option.label.en}
                            onChange={(e) =>
                              updateOption(field.id, optIdx, {
                                label: { ...option.label, en: e.target.value },
                              })
                            }
                            placeholder="English label"
                            className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-sm"
                          />
                          <input
                            type="text"
                            value={option.label.ro}
                            onChange={(e) =>
                              updateOption(field.id, optIdx, {
                                label: { en: option.label.en, ro: e.target.value },
                              })
                            }
                            placeholder="Romanian label"
                            className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => deleteOption(field.id, optIdx)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
