"use client";

import { useState } from "react";
import { Pencil, Check, X, RefreshCw } from "lucide-react";
import { getErrorMessage } from "@/lib/error";
import type { DietaryPreferences } from "@/features/onboarding/types";
import {
  DIETARY_RESTRICTION_OPTIONS,
  ALLERGY_OPTIONS,
  CUISINE_OPTIONS,
} from "@/features/onboarding/config";

interface DietaryPreferencesCardProps {
  initialPreferences: DietaryPreferences;
  onSaved: (preferences: DietaryPreferences) => void;
  editDisabled?: boolean;
}

export default function DietaryPreferencesCard({
  initialPreferences,
  onSaved,
  editDisabled = false,
}: DietaryPreferencesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<DietaryPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEdit = () => {
    setDraft(initialPreferences);
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSaveError(null);
    setIsEditing(false);
  };

  const toggle = (key: keyof DietaryPreferences, value: string) => {
    setDraft((prev) => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietaryRestrictions: draft.dietaryRestrictions,
          allergies: draft.allergies,
          cuisinePreferences: draft.cuisinePreferences,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error ?? "Failed to save preferences.");
        return;
      }

      onSaved(draft);
      setIsEditing(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const hasAny =
    initialPreferences.dietaryRestrictions.length > 0 ||
    initialPreferences.allergies.length > 0 ||
    initialPreferences.cuisinePreferences.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Dietary Preferences</h2>
        {!isEditing && (
          <div className="relative group">
            <button
              onClick={handleEdit}
              disabled={editDisabled}
              className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            {editDisabled && (
              <span className="pointer-events-none absolute right-0 top-full mt-1.5 w-max max-w-48 rounded-lg bg-gray-800 dark:bg-gray-700 px-2.5 py-1.5 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-10">
                Editing is disabled while generating meals
              </span>
            )}
          </div>
        )}
      </div>

      {/* Display mode */}
      {!isEditing && (
        <>
          {hasAny ? (
            <div className="space-y-3">
              <PreferenceRow
                label="Dietary Restrictions"
                values={initialPreferences.dietaryRestrictions}
                options={DIETARY_RESTRICTION_OPTIONS}
              />
              <PreferenceRow
                label="Allergies"
                values={initialPreferences.allergies}
                options={ALLERGY_OPTIONS}
              />
              <PreferenceRow
                label="Cuisine Preferences"
                values={initialPreferences.cuisinePreferences}
                options={CUISINE_OPTIONS}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No preferences set. Click Edit to personalise your meal suggestions.
            </p>
          )}
        </>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500">Select all that apply</p>
            <button
              type="button"
              onClick={() => setDraft({ dietaryRestrictions: [], allergies: [], cuisinePreferences: [] })}
              disabled={draft.dietaryRestrictions.length === 0 && draft.allergies.length === 0 && draft.cuisinePreferences.length === 0}
              className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
          </div>
          <TagGroup
            title="Dietary Restrictions"
            options={DIETARY_RESTRICTION_OPTIONS}
            selected={draft.dietaryRestrictions}
            onToggle={(v) => toggle("dietaryRestrictions", v)}
          />
          <TagGroup
            title="Allergies"
            options={ALLERGY_OPTIONS}
            selected={draft.allergies}
            onToggle={(v) => toggle("allergies", v)}
          />
          <TagGroup
            title="Cuisine Preferences"
            options={CUISINE_OPTIONS}
            selected={draft.cuisinePreferences}
            onToggle={(v) => toggle("cuisinePreferences", v)}
          />

          {saveError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-400">
              <p>{saveError}</p>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-1.5 font-medium underline hover:no-underline disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TagGroup({
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
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </p>
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

function PreferenceRow({
  label,
  values,
  options,
}: {
  label: string;
  values: string[];
  options: readonly { value: string; label: string }[];
}) {
  if (values.length === 0) return null;
  const labelMap = Object.fromEntries(options.map((o) => [o.value, o.label]));
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800"
          >
            {labelMap[v] ?? v}
          </span>
        ))}
      </div>
    </div>
  );
}
