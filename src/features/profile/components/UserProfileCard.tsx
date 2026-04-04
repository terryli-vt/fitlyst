"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/error";
import Link from "next/link";
import { Pencil, Check, X, RefreshCw } from "lucide-react";
import type { DBProfile, DBNutrition } from "../types";
import {
  GENDER_OPTIONS,
  ACTIVITY_LEVELS,
  GOAL_OPTIONS,
  GOAL_PRIORITY_OPTIONS,
} from "@/features/onboarding/config";
import { CM_PER_INCH, LB_PER_KG, KG_PER_LB } from "@/lib/units";

const activityLevelLabels = Object.fromEntries(ACTIVITY_LEVELS.map((o) => [o.value, o.label]));
const goalLabels = Object.fromEntries(GOAL_OPTIONS.map((o) => [o.value, o.label]));
const goalPriorityLabels = Object.fromEntries(GOAL_PRIORITY_OPTIONS.map((o) => [o.value, o.label]));

interface UserProfileCardProps {
  profile: DBProfile | null;
  onSaved: (profile: DBProfile, nutrition: DBNutrition) => void;
  editDisabled?: boolean;
}

const inputClass =
  "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white dark:bg-gray-700";
const labelClass =
  "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1";

export default function UserProfileCard({ profile, onSaved, editDisabled = false }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [editForm, setEditForm] = useState({
    heightCm: profile?.height?.toString() ?? "",
    heightFt: "",
    heightIn: "",
    weightKg: profile?.weight?.toString() ?? "",
    weightLb: "",
    age: profile?.age?.toString() ?? "",
    gender: profile?.gender ?? "",
    activityLevel: profile?.activityLevel ?? "",
    goal: profile?.goal ?? "",
    goalPriority: profile?.goalPriority ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Warn on browser-level navigation (refresh, close tab) when form is dirty
  useEffect(() => {
    if (!isEditing || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isEditing, isDirty]);

  const handleEdit = () => {
    setHeightUnit("cm");
    setWeightUnit("kg");
    setEditForm({
      heightCm: profile?.height?.toString() ?? "",
      heightFt: "",
      heightIn: "",
      weightKg: profile?.weight?.toString() ?? "",
      weightLb: "",
      age: profile?.age?.toString() ?? "",
      gender: profile?.gender ?? "",
      activityLevel: profile?.activityLevel ?? "",
      goal: profile?.goal ?? "",
      goalPriority: profile?.goalPriority ?? "",
    });
    setSaveError(null);
    setIsDirty(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    setSaveError(null);
    setIsDirty(false);
    setIsEditing(false);
  };

  const updateForm = (updater: Parameters<typeof setEditForm>[0]) => {
    setIsDirty(true);
    setEditForm(updater);
  };

  const handleHeightUnitToggle = () => {
    const newUnit = heightUnit === "cm" ? "ft" : "cm";
    if (heightUnit === "cm") {
      const cm = parseFloat(editForm.heightCm);
      if (cm > 0) {
        const totalInches = cm / CM_PER_INCH;
        const ft = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        updateForm((f) => ({ ...f, heightFt: ft.toString(), heightIn: inches.toString() }));
      }
    } else {
      const ft = parseFloat(editForm.heightFt) || 0;
      const inches = parseFloat(editForm.heightIn) || 0;
      if (ft > 0 || inches > 0) {
        const cm = Math.round((ft * 12 + inches) * CM_PER_INCH);
        updateForm((f) => ({ ...f, heightCm: cm.toString() }));
      }
    }
    setHeightUnit(newUnit);
  };

  const handleWeightUnitToggle = () => {
    const newUnit = weightUnit === "kg" ? "lb" : "kg";
    if (weightUnit === "kg") {
      const kg = parseFloat(editForm.weightKg);
      if (kg > 0) {
        const lb = Math.round(kg * LB_PER_KG * 10) / 10;
        updateForm((f) => ({ ...f, weightLb: lb.toString() }));
      }
    } else {
      const lb = parseFloat(editForm.weightLb);
      if (lb > 0) {
        const kg = Math.round(lb * KG_PER_LB * 10) / 10;
        updateForm((f) => ({ ...f, weightKg: kg.toString() }));
      }
    }
    setWeightUnit(newUnit);
  };

  const handleSave = async () => {
    const { age, gender, activityLevel, goal } = editForm;
    const goalPriority = goal === "maintain" ? "balanced" : editForm.goalPriority;

    // Resolve height to cm regardless of active unit
    const resolvedHeightCm =
      heightUnit === "cm"
        ? parseFloat(editForm.heightCm)
        : Math.round(
            (parseFloat(editForm.heightFt || "0") * 12 + parseFloat(editForm.heightIn || "0")) *
              CM_PER_INCH,
          );

    // Resolve weight to kg regardless of active unit
    const resolvedWeightKg =
      weightUnit === "kg"
        ? parseFloat(editForm.weightKg)
        : Math.round(parseFloat(editForm.weightLb || "0") * KG_PER_LB * 10) / 10;

    if (!resolvedHeightCm || !resolvedWeightKg || !age || !gender || !activityLevel || !goal || !goalPriority) {
      setSaveError("All fields are required.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: resolvedHeightCm,
          weightKg: resolvedWeightKg,
          age: parseInt(age),
          gender,
          activityLevel,
          goal,
          goalPriority,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error ?? "Failed to save profile.");
        return;
      }

      const data = await response.json();

      onSaved(
        {
          height: resolvedHeightCm,
          weight: resolvedWeightKg,
          age: parseInt(age),
          gender,
          activityLevel,
          goal,
          goalPriority,
          dietaryRestrictions: profile?.dietaryRestrictions ?? [],
          allergies: profile?.allergies ?? [],
          cuisinePreferences: profile?.cuisinePreferences ?? [],
        },
        data.nutrition,
      );

      setIsDirty(false);
      setIsEditing(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">User Profile</h2>
        {!isEditing && profile && (
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
              <span className="pointer-events-none absolute right-0 top-full mt-1.5 w-max max-w-45 rounded-lg bg-gray-800 dark:bg-gray-700 px-2.5 py-1.5 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-10">
                Editing is disabled while generating meals
              </span>
            )}
          </div>
        )}
      </div>

      {/* Display mode */}
      {profile && !isEditing && (
        <div className="grid grid-cols-2 gap-3">
          <ProfileField label="Height" value={`${profile.height} cm`} />
          <ProfileField label="Weight" value={`${profile.weight.toFixed(1)} kg`} />
          <ProfileField label="Age" value={`${profile.age} years`} />
          <ProfileField label="Gender" value={profile.gender === "male" ? "Male" : "Female"} />
          <ProfileField
            label="Activity Level"
            value={activityLevelLabels[profile.activityLevel] ?? profile.activityLevel}
            fullWidth
          />
          <ProfileField label="Goal" value={goalLabels[profile.goal] ?? profile.goal} fullWidth={profile.goal === "maintain"} />
          {profile.goal !== "maintain" && (
            <ProfileField
              label="Priority"
              value={goalPriorityLabels[profile.goalPriority] ?? profile.goalPriority}
            />
          )}
        </div>
      )}

      {/* No profile yet */}
      {!profile && !isEditing && (
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          No profile data yet. Complete{" "}
          <Link href="/onboarding" className="text-teal-600 dark:text-teal-400 hover:underline">
            onboarding
          </Link>{" "}
          to get started.
        </p>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Height */}
            <div className={heightUnit === "ft" ? "col-span-2" : ""}>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass} style={{ marginBottom: 0 }}>Height</label>
                <UnitToggle
                  options={["cm", "ft"]}
                  active={heightUnit}
                  onToggle={handleHeightUnitToggle}
                />
              </div>
              {heightUnit === "cm" ? (
                <input
                  type="number"
                  value={editForm.heightCm}
                  onChange={(e) => updateForm((f) => ({ ...f, heightCm: e.target.value }))}
                  className={inputClass}
                  placeholder="175"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editForm.heightFt}
                    onChange={(e) => updateForm((f) => ({ ...f, heightFt: e.target.value }))}
                    className={inputClass}
                    placeholder="ft"
                    min="0"
                  />
                  <input
                    type="number"
                    value={editForm.heightIn}
                    onChange={(e) => updateForm((f) => ({ ...f, heightIn: e.target.value }))}
                    className={inputClass}
                    placeholder="in"
                    min="0"
                    max="11"
                  />
                </div>
              )}
            </div>
            {/* Weight */}
            <div className={heightUnit === "ft" ? "col-span-2" : ""}>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass} style={{ marginBottom: 0 }}>Weight</label>
                <UnitToggle
                  options={["kg", "lb"]}
                  active={weightUnit}
                  onToggle={handleWeightUnitToggle}
                />
              </div>
              <input
                type="number"
                value={weightUnit === "kg" ? editForm.weightKg : editForm.weightLb}
                onChange={(e) =>
                  weightUnit === "kg"
                    ? updateForm((f) => ({ ...f, weightKg: e.target.value }))
                    : updateForm((f) => ({ ...f, weightLb: e.target.value }))
                }
                className={inputClass}
                placeholder={weightUnit === "kg" ? "70" : "154"}
              />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input
                type="number"
                value={editForm.age}
                onChange={(e) => updateForm((f) => ({ ...f, age: e.target.value }))}
                className={inputClass}
                placeholder="25"
              />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={editForm.gender}
                onChange={(e) => updateForm((f) => ({ ...f, gender: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select…</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Activity Level</label>
            <select
              value={editForm.activityLevel}
              onChange={(e) => updateForm((f) => ({ ...f, activityLevel: e.target.value }))}
              className={inputClass}
            >
              <option value="">Select…</option>
              {ACTIVITY_LEVELS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={editForm.goal === "maintain" ? "col-span-2" : ""}>
              <label className={labelClass}>Goal</label>
              <select
                value={editForm.goal}
                onChange={(e) => updateForm((f) => ({ ...f, goal: e.target.value, goalPriority: e.target.value === "maintain" ? "balanced" : f.goalPriority }))}
                className={inputClass}
              >
                <option value="">Select…</option>
                {GOAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {editForm.goal !== "maintain" && (
              <div>
                <label className={labelClass}>Priority</label>
                <select
                  value={editForm.goalPriority}
                  onChange={(e) => updateForm((f) => ({ ...f, goalPriority: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {GOAL_PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
                  Save Changes
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

function UnitToggle({
  options,
  active,
  onToggle,
}: {
  options: [string, string];
  active: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 text-xs">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => opt !== active && onToggle()}
          className={`px-2 py-0.5 transition-colors ${
            opt === active
              ? "bg-teal-600 text-white"
              : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ProfileField({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 ${fullWidth ? "col-span-2" : ""}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-gray-800 dark:text-gray-100 font-semibold text-sm">{value}</p>
    </div>
  );
}
