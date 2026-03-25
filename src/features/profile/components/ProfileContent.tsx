"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileHeader from "./ProfileHeader";
import UserProfileCard from "./UserProfileCard";
import NutritionCard from "./NutritionCard";
import MealRecommendations from "./MealRecommendations";
import type { DBProfile, DBNutrition, UserInfo } from "../types";
import type { MealIdea } from "@/features/onboarding/types";

interface ProfileContentProps {
  user: UserInfo;
  initialProfile: DBProfile | null;
  initialNutrition: DBNutrition | null;
  initialMeals: MealIdea[] | null;
}

export default function ProfileContent({
  user,
  initialProfile,
  initialNutrition,
  initialMeals,
}: ProfileContentProps) {
  const [profile, setProfile] = useState<DBProfile | null>(initialProfile);
  const [nutrition, setNutrition] = useState<DBNutrition | null>(initialNutrition);

  const handleSaved = (newProfile: DBProfile, newNutrition: DBNutrition) => {
    setProfile(newProfile);
    setNutrition(newNutrition);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white py-10 px-4">
      <div className="w-[90%] max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <ProfileHeader user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <UserProfileCard profile={profile} onSaved={handleSaved} />
          {nutrition && <NutritionCard nutrition={nutrition} />}
        </div>

        {nutrition && (
          <MealRecommendations initialMeals={initialMeals} nutrition={nutrition} />
        )}
      </div>
    </div>
  );
}
