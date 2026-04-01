import type { UserProfile } from "../types";
import { LB_PER_KG, KG_PER_LB } from "@/lib/units";

interface WeightInputProps {
  value: UserProfile["weight"];
  unit: "kg" | "lb";
  onUnitChange: (unit: "kg" | "lb") => void;
  onChange: (weight: UserProfile["weight"]) => void;
}

export function WeightInput({
  value,
  unit,
  onUnitChange,
  onChange,
}: WeightInputProps) {
  const handleUnitToggle = () => {
    const newUnit = unit === "kg" ? "lb" : "kg";
    onUnitChange(newUnit);

    const currentValue = parseFloat(value.value);

    if (currentValue > 0) {
      let convertedValue: number;
      if (unit === "kg") {
        convertedValue = Math.round(currentValue * LB_PER_KG * 10) / 10;
      } else {
        convertedValue = Math.round(currentValue * KG_PER_LB * 10) / 10;
      }
      onChange({ unit: newUnit, value: convertedValue.toString() });
      return;
    }

    onChange({ ...value, unit: newUnit, value: "" });
  };

  return (
    <div className="space-y-4">
      {/* Unit Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${unit === "kg" ? "text-teal-700 dark:text-teal-400" : "text-gray-400 dark:text-gray-500"}`}>
          kg
        </span>
        <button
          type="button"
          onClick={handleUnitToggle}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              unit === "lb" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${unit === "lb" ? "text-teal-700 dark:text-teal-400" : "text-gray-400 dark:text-gray-500"}`}>
          lb
        </span>
      </div>

      {/* Input Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Weight ({unit})
        </label>
        <input
          type="number"
          value={value.value}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
          placeholder={`Enter weight in ${unit}`}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
          min="0"
          step="0.1"
        />
      </div>
    </div>
  );
}
