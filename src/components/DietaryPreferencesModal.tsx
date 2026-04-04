"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { DietaryPreferences } from "@/features/onboarding/types";
import {
  DIETARY_RESTRICTION_OPTIONS,
  ALLERGY_OPTIONS,
  CUISINE_OPTIONS,
} from "@/features/onboarding/config";

interface DietaryPreferencesModalProps {
  isOpen: boolean;
  initialPreferences: DietaryPreferences;
  isSaving: boolean;
  onConfirm: (preferences: DietaryPreferences) => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function DietaryPreferencesModal({
  isOpen,
  initialPreferences,
  isSaving,
  onConfirm,
  onSkip,
  onClose,
}: DietaryPreferencesModalProps) {
  const [prefs, setPrefs] = useState<DietaryPreferences>(initialPreferences);

  // Sync with initialPreferences when modal opens
  // (handled by parent re-mounting or key prop if needed)

  if (!isOpen) return null;

  const toggle = (key: keyof DietaryPreferences, value: string) => {
    setPrefs((prev) => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Dietary Preferences</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Personalise your meal suggestions. Your choices will be saved.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <PreferenceSection
            title="Dietary Restrictions"
            options={DIETARY_RESTRICTION_OPTIONS}
            selected={prefs.dietaryRestrictions}
            onToggle={(v) => toggle("dietaryRestrictions", v)}
          />
          <PreferenceSection
            title="Allergies"
            options={ALLERGY_OPTIONS}
            selected={prefs.allergies}
            onToggle={(v) => toggle("allergies", v)}
          />
          <PreferenceSection
            title="Cuisine Preferences"
            options={CUISINE_OPTIONS}
            selected={prefs.cuisinePreferences}
            onToggle={(v) => toggle("cuisinePreferences", v)}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onSkip}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Generate without preferences
          </button>
          <button
            onClick={() => onConfirm(prefs)}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreferenceSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
