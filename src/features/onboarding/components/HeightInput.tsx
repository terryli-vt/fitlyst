import type { UserProfile } from "../types";
import { CM_PER_INCH } from "@/lib/units";

interface HeightInputProps {
  value: UserProfile["height"];
  unit: "cm" | "ft";
  onUnitChange: (unit: "cm" | "ft") => void;
  onChange: (height: UserProfile["height"]) => void;
}

export function HeightInput({
  value,
  unit,
  onUnitChange,
  onChange,
}: HeightInputProps) {
  const handleUnitToggle = () => {
    const newUnit = unit === "cm" ? "ft" : "cm";
    onUnitChange(newUnit);

    const currentValue = parseFloat(value.value);
    const currentInches = parseFloat(value.inches || "0");

    if (unit === "cm" && currentValue > 0) {
      const totalInches = currentValue / CM_PER_INCH;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      onChange({ unit: newUnit, value: feet.toString(), inches: inches.toString() });
      return;
    }

    if (unit === "ft" && currentValue > 0) {
      const totalInches = currentValue * 12 + currentInches;
      const cm = Math.round(totalInches * CM_PER_INCH);
      onChange({ unit: newUnit, value: cm.toString(), inches: undefined });
      return;
    }

    onChange({ ...value, unit: newUnit, value: "", inches: newUnit === "ft" ? value.inches || "" : undefined });
  };

  return (
    <div className="space-y-4">
      {/* Unit Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${unit === "cm" ? "text-teal-700 dark:text-teal-400" : "text-gray-400 dark:text-gray-500"}`}>
          cm
        </span>
        <button
          type="button"
          onClick={handleUnitToggle}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              unit === "ft" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${unit === "ft" ? "text-teal-700 dark:text-teal-400" : "text-gray-400 dark:text-gray-500"}`}>
          ft/in
        </span>
      </div>

      {/* Input Fields */}
      {unit === "cm" ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            value={value.value}
            onChange={(e) => onChange({ ...value, value: e.target.value })}
            placeholder="Enter height in cm"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
            min="0"
            step="0.1"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feet
            </label>
            <input
              type="number"
              value={value.value}
              onChange={(e) => onChange({ ...value, value: e.target.value })}
              placeholder="ft"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Inches
            </label>
            <input
              type="number"
              value={value.inches || ""}
              onChange={(e) => onChange({ ...value, inches: e.target.value })}
              placeholder="in"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
              min="0"
              max="11"
            />
          </div>
        </div>
      )}
    </div>
  );
}
