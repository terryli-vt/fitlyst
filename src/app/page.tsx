import Link from "next/link";
import { Sparkles, Github, Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-teal-50 to-white dark:from-gray-800 dark:to-gray-950 pt-16 pb-20 px-4 sm:pt-16 sm:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-teal-700 dark:text-teal-400 mb-6 tracking-tight">
            Fitlyst
          </h1>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Nutrition</span>
          </div>

          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl text-balance text-black dark:text-white">
            Your Personal AI Nutrition & Fitness Companion
          </h2>

          <p className="mb-10 text-lg text-gray-600 dark:text-gray-400 md:text-xl leading-relaxed max-w-2xl mx-auto">
            Transform your health journey with intelligent meal planning
            tailored to your unique metrics and goals. Evidence-based nutrition
            made effortless.
          </p>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <main className="flex-1 py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Science-based tools designed for beginners and intermediate
              fitness enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-8 rounded-2xl border border-teal-100 dark:border-teal-800 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-teal-700 dark:text-teal-400 mb-3">
                Personalized Calorie & Macro Planning
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Get custom calorie and macronutrient targets tailored to your
                goals, activity level, and body composition. No more
                guessing—just science-based planning.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-8 rounded-2xl border border-orange-100 dark:border-orange-800 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-teal-700 dark:text-teal-400 mb-3">
                AI-Powered Meal Suggestions
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Receive intelligent meal recommendations that fit your
                preferences, dietary restrictions, and nutritional goals. Let AI
                do the meal planning for you.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 p-8 rounded-2xl border border-cyan-100 dark:border-cyan-800 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-teal-700 dark:text-teal-400 mb-3">
                Beginner-Friendly Guidance
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Start your fitness journey with confidence. Clear explanations,
                step-by-step guidance, and educational content designed for
                those new to nutrition and fitness.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            <strong className="text-gray-700 dark:text-gray-300">
              Disclaimer:
            </strong>{" "}
            Fitlyst provides general nutrition and fitness information for
            educational purposes only. This information is not intended as
            medical advice, diagnosis, or treatment. Always consult with a
            healthcare professional before making significant changes to your
            diet or exercise routine, especially if you have pre-existing health
            conditions.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <a
              href="https://github.com/terryli-vt/fitlyst"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:terryli199@gmail.com"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            © {new Date().getFullYear()} Fitlyst. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
