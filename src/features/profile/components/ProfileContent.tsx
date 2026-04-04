"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileHeader from "./ProfileHeader";
import UserProfileCard from "./UserProfileCard";
import NutritionCard from "./NutritionCard";
import MealRecommendations from "./MealRecommendations";
import DietaryPreferencesCard from "./DietaryPreferencesCard";
import type { DBProfile, DBNutrition, UserInfo } from "../types";
import type { MealIdea, DietaryPreferences } from "@/features/onboarding/types";

interface ProfileContentProps {
  user: UserInfo;
  initialProfile: DBProfile | null;
  initialNutrition: DBNutrition | null;
  initialMeals: MealIdea[] | null;
  initialRemainingGenerations: number;
  initialPreferences: DietaryPreferences;
}

export default function ProfileContent({
  user,
  initialProfile,
  initialNutrition,
  initialMeals,
  initialRemainingGenerations,
  initialPreferences,
}: ProfileContentProps) {
  const [profile, setProfile] = useState<DBProfile | null>(initialProfile);
  const [nutrition, setNutrition] = useState<DBNutrition | null>(initialNutrition);
  const [preferences, setPreferences] = useState<DietaryPreferences>(initialPreferences);
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);

  const handleSaved = (newProfile: DBProfile, newNutrition: DBNutrition) => {
    setProfile(newProfile);
    setNutrition(newNutrition);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
      <Navbar showLogin={false} />
      <div className="flex-1 py-10 px-4">
      <div className="w-[90%] max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <ProfileHeader user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <UserProfileCard profile={profile} onSaved={handleSaved} editDisabled={isGeneratingMeals} />
          {nutrition && <NutritionCard nutrition={nutrition} />}
        </div>

        {profile && (
          <div className="mb-6">
            <DietaryPreferencesCard
              initialPreferences={preferences}
              onSaved={setPreferences}
              editDisabled={isGeneratingMeals}
            />
          </div>
        )}

        {nutrition && (
          <MealRecommendations
            initialMeals={initialMeals}
            nutrition={nutrition}
            initialRemainingGenerations={initialRemainingGenerations}
            preferences={preferences}
            onGeneratingChange={setIsGeneratingMeals}
          />
        )}
      </div>
      </div>
    </div>
  );
}
