import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Get Started — Fitlyst",
  description: "Set up your Fitlyst profile to receive a personalized calorie and macro plan tailored to your goals.",
};
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (profile) {
    redirect("/profile");
  }

  return <OnboardingClient />;
}
