import type { DBNutrition } from "../types";
import NutritionStat from "@/components/NutritionStat";

export default function NutritionCard({ nutrition }: { nutrition: DBNutrition }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Nutrition Recommendations</h2>

      <div className="grid grid-cols-2 gap-3">
        <NutritionStat
          label="Daily Calories"
          value={nutrition.calories}
          unit="kcal"
          colorClass="bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
        />
        <NutritionStat
          label="Protein"
          value={nutrition.protein}
          unit="g/day"
          colorClass="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        />
        <NutritionStat
          label="Carbohydrates"
          value={nutrition.carbs}
          unit="g/day"
          colorClass="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        />
        <NutritionStat
          label="Fat"
          value={nutrition.fat}
          unit="g/day"
          colorClass="bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">BMI</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{nutrition.bmi}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">BMR</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {Math.round(nutrition.bmr)}{" "}
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">kcal</span>
          </p>
        </div>
      </div>
    </div>
  );
}
