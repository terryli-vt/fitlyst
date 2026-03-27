"use client";

import { useState } from "react";
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

const activityLevelLabels = Object.fromEntries(ACTIVITY_LEVELS.map((o) => [o.value, o.label]));
const goalLabels = Object.fromEntries(GOAL_OPTIONS.map((o) => [o.value, o.label]));
const goalPriorityLabels = Object.fromEntries(GOAL_PRIORITY_OPTIONS.map((o) => [o.value, o.label]));

interface UserProfileCardProps {
  profile: DBProfile | null;
  onSaved: (profile: DBProfile, nutrition: DBNutrition) => void;
  editDisabled?: boolean;
}

const inputClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
const labelClass =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export default function UserProfileCard({ profile, onSaved, editDisabled = false }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    heightCm: profile?.height?.toString() ?? "",
    weightKg: profile?.weight?.toString() ?? "",
    age: profile?.age?.toString() ?? "",
    gender: profile?.gender ?? "",
    activityLevel: profile?.activityLevel ?? "",
    goal: profile?.goal ?? "",
    goalPriority: profile?.goalPriority ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEdit = () => {
    setEditForm({
      heightCm: profile?.height?.toString() ?? "",
      weightKg: profile?.weight?.toString() ?? "",
      age: profile?.age?.toString() ?? "",
      gender: profile?.gender ?? "",
      activityLevel: profile?.activityLevel ?? "",
      goal: profile?.goal ?? "",
      goalPriority: profile?.goalPriority ?? "",
    });
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const { heightCm, weightKg, age, gender, activityLevel, goal, goalPriority } = editForm;
    if (!heightCm || !weightKg || !age || !gender || !activityLevel || !goal || !goalPriority) {
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
          heightCm: parseFloat(heightCm),
          weightKg: parseFloat(weightKg),
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
          height: parseFloat(heightCm),
          weight: parseFloat(weightKg),
          age: parseInt(age),
          gender,
          activityLevel,
          goal,
          goalPriority,
        },
        data.nutrition,
      );

      setIsEditing(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">User Profile</h2>
        {!isEditing && profile && (
          <button
            onClick={handleEdit}
            disabled={editDisabled}
            className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
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
          <ProfileField label="Goal" value={goalLabels[profile.goal] ?? profile.goal} />
          <ProfileField
            label="Priority"
            value={goalPriorityLabels[profile.goalPriority] ?? profile.goalPriority}
          />
        </div>
      )}

      {/* No profile yet */}
      {!profile && !isEditing && (
        <p className="text-gray-400 text-sm">
          No profile data yet. Complete{" "}
          <Link href="/onboarding" className="text-teal-600 hover:underline">
            onboarding
          </Link>{" "}
          to get started.
        </p>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Height (cm)</label>
              <input
                type="number"
                value={editForm.heightCm}
                onChange={(e) => setEditForm((f) => ({ ...f, heightCm: e.target.value }))}
                className={inputClass}
                placeholder="175"
              />
            </div>
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input
                type="number"
                value={editForm.weightKg}
                onChange={(e) => setEditForm((f) => ({ ...f, weightKg: e.target.value }))}
                className={inputClass}
                placeholder="70"
              />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input
                type="number"
                value={editForm.age}
                onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))}
                className={inputClass}
                placeholder="25"
              />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
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
              onChange={(e) => setEditForm((f) => ({ ...f, activityLevel: e.target.value }))}
              className={inputClass}
            >
              <option value="">Select…</option>
              {ACTIVITY_LEVELS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Goal</label>
              <select
                value={editForm.goal}
                onChange={(e) => setEditForm((f) => ({ ...f, goal: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select…</option>
                {GOAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={editForm.goalPriority}
                onChange={(e) => setEditForm((f) => ({ ...f, goalPriority: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select…</option>
                {GOAL_PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {saveError && <p className="text-red-500 text-sm">{saveError}</p>}

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
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
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
    <div className={`bg-gray-50 rounded-xl px-4 py-3 ${fullWidth ? "col-span-2" : ""}`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-gray-800 font-semibold text-sm">{value}</p>
    </div>
  );
}
