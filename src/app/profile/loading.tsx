import Navbar from "@/components/Navbar";

const Bone = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className}`} />
);

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
      <Navbar showLogin={false} />

      <div className="flex-1 py-10 px-4">
        <div className="w-[90%] max-w-7xl mx-auto">
          {/* Back link */}
          <Bone className="h-4 w-28 mb-8" />

          {/* ProfileHeader */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-5 flex-1">
              <Bone className="w-20 h-20 !rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Bone className="h-6 w-40" />
                <Bone className="h-4 w-52" />
              </div>
            </div>
            <Bone className="h-9 w-24 shrink-0" />
          </div>

          {/* UserProfileCard + NutritionCard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* UserProfileCard */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <Bone className="h-5 w-28" />
                <Bone className="h-4 w-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                    <Bone className="h-3 w-16 mb-2" />
                    <Bone className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* NutritionCard */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <Bone className="h-5 w-48 mb-5" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700">
                    <Bone className="h-3 w-20 mb-2" />
                    <Bone className="h-7 w-16" />
                    <Bone className="h-3 w-12 mt-1" />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                    <Bone className="h-3 w-10 mb-2" />
                    <Bone className="h-7 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MealRecommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <Bone className="h-5 w-44" />
              <Bone className="h-4 w-20" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
                  <Bone className="h-4 w-16" />
                  <Bone className="h-5 w-36" />
                  <Bone className="h-3 w-full" />
                  <Bone className="h-3 w-4/5" />
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Bone key={j} className="h-8" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
