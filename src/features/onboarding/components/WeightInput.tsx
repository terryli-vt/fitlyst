import type { UserProfile } from "../types";

interface WeightInputProps {
  value: UserProfile["weight"];
  unit: "kg" | "lb";
  onUnitChange: (unit: "kg" | "lb") => void;
  onChange: (weight: UserProfile["weight"]) => void;
}

/**
 * Weight Input Component
 * Allows user to input weight with unit toggle (kg or lb)
 */
export function WeightInput({
  value,
  unit,
  onUnitChange,
  onChange,
}: WeightInputProps) {
  const handleUnitToggle = () => {
    const newUnit = unit === "kg" ? "lb" : "kg";
    onUnitChange(newUnit);

    // Convert existing values if valid
    const currentValue = parseFloat(value.value);

    // If there's a valid value, convert it
    if (currentValue > 0) {
      let convertedValue: number;
      if (unit === "kg") {
        // Convert kg to lb (1 kg = 2.20462 lb)
        convertedValue = Math.round(currentValue * 2.20462 * 10) / 10;
      } else {
        // Convert lb to kg (1 lb = 0.453592 kg)
        convertedValue = Math.round(currentValue * 0.453592 * 10) / 10;
      }
      onChange({
        unit: newUnit,
        value: convertedValue.toString(),
      });
      return;
    }

    // If no valid value, clear it
    onChange({
      ...value,
      unit: newUnit,
      value: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Unit Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span
          className={`text-sm font-medium ${
            unit === "kg" ? "text-teal-700" : "text-gray-400"
          }`}
        >
          kg
        </span>
        <button
          type="button"
          onClick={handleUnitToggle}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              unit === "lb" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${
            unit === "lb" ? "text-teal-700" : "text-gray-400"
          }`}
        >
          lb
        </span>
      </div>

      {/* Input Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weight ({unit})
        </label>
        <input
          type="number"
          value={value.value}
          onChange={(e) =>
            onChange({
              ...value,
              value: e.target.value,
            })
          }
          placeholder={`Enter weight in ${unit}`}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
          min="0"
          step="0.1"
        />
      </div>
    </div>
  );
}
