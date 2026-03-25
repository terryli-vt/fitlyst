"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  ArrowLeft,
  Pencil,
  X,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import type { MealIdea } from "@/features/onboarding/types";

type DBProfile = {
  height: number;
  weight: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
  goalPriority: string;
};

type DBNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmi: number;
  bmr: number;
};

type UserInfo = {
  name: string | null;
  email: string | null;
  image: string | null;
};

interface ProfileContentProps {
  user: UserInfo;
  initialProfile: DBProfile | null;
  initialNutrition: DBNutrition | null;
  initialMeals: MealIdea[] | null;
}

const activityLevelLabels: Record<string, string> = {
  sedentary: "Sedentary",
  light: "Light (1–3 days/week)",
  moderate: "Moderate (3–5 days/week)",
  active: "Active (6–7 days/week)",
  very_active: "Very Active (Athlete)",
};

const goalLabels: Record<string, string> = {
  bulk: "Bulk (Build Muscle)",
  cut: "Cut (Lose Fat)",
};

const goalPriorityLabels: Record<string, string> = {
  aggressive: "Aggressive",
  balanced: "Balanced",
  conservative: "Conservative",
};

export default function ProfileContent({
  user,
  initialProfile,
  initialNutrition,
  initialMeals,
}: ProfileContentProps) {
  const [profile, setProfile] = useState<DBProfile | null>(initialProfile);
  const [nutrition, setNutrition] = useState<DBNutrition | null>(initialNutrition);
  const [meals, setMeals] = useState<MealIdea[] | null>(initialMeals);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    heightCm: initialProfile?.height?.toString() ?? "",
    weightKg: initialProfile?.weight?.toString() ?? "",
    age: initialProfile?.age?.toString() ?? "",
    gender: initialProfile?.gender ?? "",
    activityLevel: initialProfile?.activityLevel ?? "",
    goal: initialProfile?.goal ?? "",
    goalPriority: initialProfile?.goalPriority ?? "",
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Meal generation state
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);
  const [mealError, setMealError] = useState<string | null>(null);

  // Expanded meal cooking instructions
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

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
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSaveProfile = async () => {
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

      setProfile({
        height: parseFloat(heightCm),
        weight: parseFloat(weightKg),
        age: parseInt(age),
        gender,
        activityLevel,
        goal,
        goalPriority,
      });

      if (data.nutrition) {
        setNutrition(data.nutrition);
      }

      setIsEditing(false);
    } catch {
      setSaveError("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateMeals = async () => {
    if (!nutrition) return;

    setIsGeneratingMeals(true);
    setMealError(null);

    try {
      const genResponse = await fetch("/api/generate-meal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutrition }),
      });

      if (!genResponse.ok) {
        const data = await genResponse.json();
        setMealError(data.error ?? "Failed to generate meal ideas.");
        return;
      }

      const { mealIdeas: newMeals } = await genResponse.json();

      await fetch("/api/meal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: newMeals }),
      });

      setMeals(newMeals);
      setExpandedMeal(null);
    } catch {
      setMealError("An error occurred. Please try again.");
    } finally {
      setIsGeneratingMeals(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
  const labelClass =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-10 px-4">
      <div className="w-[90%] max-w-7xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* ── Header: Avatar + User Info + Sign Out ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-5">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Avatar"}
              width={80}
              height={80}
              className="rounded-full ring-4 ring-teal-100 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
              <User className="h-9 w-9 text-teal-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {user.name ?? "User"}
            </h1>
            <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm">
              <Mail className="h-4 w-4 shrink-0" />
              {user.email ?? "—"}
            </p>
          </div>
          <div className="shrink-0">
            <SignOutButton />
          </div>
        </div>

        {/* ── Main grid: User Profile | Nutrition ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">User Profile</h2>
              {!isEditing && profile && (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
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
                <ProfileField
                  label="Gender"
                  value={profile.gender === "male" ? "Male" : "Female"}
                />
                <ProfileField
                  label="Activity Level"
                  value={activityLevelLabels[profile.activityLevel] ?? profile.activityLevel}
                  fullWidth
                />
                <ProfileField
                  label="Goal"
                  value={goalLabels[profile.goal] ?? profile.goal}
                />
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
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, heightCm: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Weight (kg)</label>
                    <input
                      type="number"
                      value={editForm.weightKg}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, weightKg: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, age: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, gender: e.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="">Select…</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Activity Level</label>
                  <select
                    value={editForm.activityLevel}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, activityLevel: e.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light (1–3 days/week)</option>
                    <option value="moderate">Moderate (3–5 days/week)</option>
                    <option value="active">Active (6–7 days/week)</option>
                    <option value="very_active">Very Active (Athlete)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Goal</label>
                    <select
                      value={editForm.goal}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, goal: e.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="">Select…</option>
                      <option value="bulk">Bulk</option>
                      <option value="cut">Cut</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Priority</label>
                    <select
                      value={editForm.goalPriority}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, goalPriority: e.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="">Select…</option>
                      <option value="aggressive">Aggressive</option>
                      <option value="balanced">Balanced</option>
                      <option value="conservative">Conservative</option>
                    </select>
                  </div>
                </div>

                {saveError && (
                  <p className="text-red-500 text-sm">{saveError}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSaveProfile}
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
                    onClick={handleCancelEdit}
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

          {/* Nutrition Recommendations Card */}
          {nutrition && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Nutrition Recommendations
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <NutritionStat
                  label="Daily Calories"
                  value={nutrition.calories}
                  unit="kcal"
                  colorClass="bg-teal-50 text-teal-700"
                />
                <NutritionStat
                  label="Protein"
                  value={nutrition.protein}
                  unit="g/day"
                  colorClass="bg-blue-50 text-blue-700"
                />
                <NutritionStat
                  label="Carbohydrates"
                  value={nutrition.carbs}
                  unit="g/day"
                  colorClass="bg-amber-50 text-amber-700"
                />
                <NutritionStat
                  label="Fat"
                  value={nutrition.fat}
                  unit="g/day"
                  colorClass="bg-rose-50 text-rose-700"
                />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                    BMI
                  </p>
                  <p className="text-2xl font-bold text-gray-800">{nutrition.bmi}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                    BMR
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round(nutrition.bmr)}{" "}
                    <span className="text-sm font-medium text-gray-500">kcal</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Meal Recommendations ── */}
        {nutrition && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Meal Recommendations</h2>
              <button
                onClick={handleGenerateMeals}
                disabled={isGeneratingMeals}
                className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isGeneratingMeals ? "animate-spin" : ""}`}
                />
                {isGeneratingMeals ? "Generating…" : meals ? "Regenerate" : "Generate"}
              </button>
            </div>

            {mealError && (
              <p className="text-red-500 text-sm mb-4">{mealError}</p>
            )}

            {isGeneratingMeals && (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="text-sm">Generating personalized meal ideas…</span>
              </div>
            )}

            {!isGeneratingMeals && meals && meals.length > 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {meals.map((meal, index) => (
                    <MealCard
                      key={index}
                      meal={meal}
                      isExpanded={expandedMeal === index}
                      onToggle={() =>
                        setExpandedMeal(expandedMeal === index ? null : index)
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 italic mt-5 text-center">
                  Meal ideas are AI-generated and not medical advice.
                </p>
              </>
            )}

            {!isGeneratingMeals && !meals && (
              <p className="text-gray-400 text-sm text-center py-10">
                Click &quot;Generate&quot; to create personalized meal recommendations based on
                your nutrition plan.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-gray-800 font-semibold text-sm">{value}</p>
    </div>
  );
}

function NutritionStat({
  label,
  value,
  unit,
  colorClass,
}: {
  label: string;
  value: number;
  unit: string;
  colorClass: string;
}) {
  return (
    <div className={`rounded-xl px-4 py-3 ${colorClass}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-bold">
        {value}{" "}
        <span className="text-sm font-medium opacity-70">{unit}</span>
      </p>
    </div>
  );
}

function MealCard({
  meal,
  isExpanded,
  onToggle,
}: {
  meal: MealIdea;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="mb-3">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700 capitalize">
          {meal.mealType}
        </span>
      </div>

      <h4 className="text-base font-bold text-gray-900 mb-1.5">{meal.name}</h4>

      {meal.description && (
        <p className="text-gray-500 text-sm mb-3 leading-relaxed">{meal.description}</p>
      )}

      <div className="mb-3">
        <span className="text-lg font-bold text-teal-700">{meal.macros.calories}</span>
        <span className="text-sm text-gray-500 ml-1">kcal</span>
      </div>

      <div className="grid grid-cols-3 gap-1 text-xs pt-3 border-t border-gray-100 mt-auto">
        <div className="text-center">
          <p className="text-gray-400 font-medium">Protein</p>
          <p className="font-bold text-gray-700">{meal.macros.protein}g</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 font-medium">Carbs</p>
          <p className="font-bold text-gray-700">{meal.macros.carbs}g</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 font-medium">Fat</p>
          <p className="font-bold text-gray-700">{meal.macros.fat}g</p>
        </div>
      </div>

      {meal.cookingInstructions && meal.cookingInstructions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={onToggle}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs font-semibold text-teal-600">
              Cooking Instructions
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-teal-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-teal-600" />
            )}
          </button>
          {isExpanded && (
            <ol className="mt-3 space-y-1.5 list-decimal list-inside">
              {meal.cookingInstructions.map((step, i) => (
                <li key={i} className="text-xs text-gray-600 leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
