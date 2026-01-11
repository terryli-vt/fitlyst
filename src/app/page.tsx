/**
 * Fitlyst Landing Page
 *
 * This is a Server Component (default in Next.js App Router).
 * No client-side interactivity needed for this static landing page,
 * so we don't need 'use client' directive.
 */

import Link from "next/link";
import { Sparkles, Github, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-teal-50 to-white pt-12 pb-20 px-4 sm:pt-16 sm:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* App Name - Large, bold, brand color */}
          <h1 className="text-5xl sm:text-6xl font-bold text-teal-700 mb-6 tracking-tight">
            Fitlyst
          </h1>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Nutrition</span>
          </div>

          {/* Tagline - Clear value proposition */}
          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl text-balance text-black">
            Your Personal AI Nutrition & Fitness Companion
          </h2>

          {/* Sub-tagline - Additional context for beginners */}
          <p className="mb-10 text-lg text-gray-600 md:text-xl leading-relaxed max-w-2xl mx-auto">
            Transform your health journey with intelligent meal planning
            tailored to your unique metrics and goals. Evidence-based nutrition
            made effortless.
          </p>

          {/* CTA Button - Primary action, uses accent color (orange) for energy */}
          <Link
            href="/onboarding"
            className="inline-block bg-orange-400 hover:bg-orange-500 text-white font-semibold py-4 px-8 rounded-full text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <main className="flex-1 py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Science-based tools designed for beginners and intermediate
              fitness enthusiasts
            </p>
          </div>

          {/* Features Grid
              Responsive: 1 column on mobile, 3 columns on desktop
              Gap: Consistent spacing between cards
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1: Personalized Planning */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-100 hover:shadow-lg transition-shadow duration-300">
              {/* Icon placeholder - using emoji for simplicity, could be replaced with SVG */}
              <div className="text-4xl mb-4">📊</div>

              {/* Feature Title */}
              <h3 className="text-xl font-bold text-teal-700 mb-3">
                Personalized Calorie & Macro Planning
              </h3>

              {/* Feature Description */}
              <p className="text-gray-700 leading-relaxed">
                Get custom calorie and macronutrient targets tailored to your
                goals, activity level, and body composition. No more
                guessing—just science-based planning.
              </p>
            </div>

            {/* Feature Card 2: AI Meal Suggestions */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-teal-700 mb-3">
                AI-Powered Meal Suggestions
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Receive intelligent meal recommendations that fit your
                preferences, dietary restrictions, and nutritional goals. Let AI
                do the meal planning for you.
              </p>
            </div>

            {/* Feature Card 3: Beginner-Friendly */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-8 rounded-2xl border border-cyan-100 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-teal-700 mb-3">
                Beginner-Friendly Guidance
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Start your fitness journey with confidence. Clear explanations,
                step-by-step guidance, and educational content designed for
                those new to nutrition and fitness.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Disclaimer Text
              Critical for health apps: protects against liability
              Styling: Smaller text, muted color, but still readable
          */}
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
            <strong className="text-gray-700">Disclaimer:</strong> Fitlyst
            provides general nutrition and fitness information for educational
            purposes only. This information is not intended as medical advice,
            diagnosis, or treatment. Always consult with a healthcare
            professional before making significant changes to your diet or
            exercise routine, especially if you have pre-existing health
            conditions.
          </p>

          {/* Social Links - GitHub and Email */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <a
              href="https://github.com/terryli-vt/fitlyst"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:terryli199@gmail.com"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright - Standard footer element */}
          <p className="text-sm text-gray-500 mt-4">
            © {new Date().getFullYear()} Fitlyst. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
