import type { UserProfile } from "../types";

interface HeightInputProps {
  value: UserProfile["height"];
  unit: "cm" | "ft";
  onUnitChange: (unit: "cm" | "ft") => void;
  onChange: (height: UserProfile["height"]) => void;
}

/**
 * Height Input Component
 * Allows user to input height with unit toggle (cm or ft/in)
 */
export function HeightInput({
  value,
  unit,
  onUnitChange,
  onChange,
}: HeightInputProps) {
  const handleUnitToggle = () => {
    const newUnit = unit === "cm" ? "ft" : "cm";
    onUnitChange(newUnit);

    // Convert existing values if valid
    const currentValue = parseFloat(value.value);
    const currentInches = parseFloat(value.inches || "0");

    // If converting from cm to ft/in
    if (unit === "cm" && currentValue > 0) {
      const totalInches = currentValue / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      onChange({
        unit: newUnit,
        value: feet.toString(),
        inches: inches.toString(),
      });
      return;
    }

    // If converting from ft/in to cm
    if (unit === "ft" && currentValue > 0) {
      const totalInches = currentValue * 12 + currentInches;
      const cm = Math.round(totalInches * 2.54);
      onChange({
        unit: newUnit,
        value: cm.toString(),
        inches: undefined,
      });
      return;
    }

    // If no valid value, clear it
    onChange({
      ...value,
      unit: newUnit,
      value: "",
      inches: newUnit === "ft" ? value.inches || "" : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Unit Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span
          className={`text-sm font-medium ${
            unit === "cm" ? "text-teal-700" : "text-gray-400"
          }`}
        >
          cm
        </span>
        <button
          type="button"
          onClick={handleUnitToggle}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              unit === "ft" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${
            unit === "ft" ? "text-teal-700" : "text-gray-400"
          }`}
        >
          ft/in
        </span>
      </div>

      {/* Input Fields */}
      {unit === "cm" ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (cm)
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
            placeholder="Enter height in cm"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
            min="0"
            step="0.1"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feet
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
              placeholder="ft"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inches
            </label>
            <input
              type="number"
              value={value.inches || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  inches: e.target.value,
                })
              }
              placeholder="in"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
              min="0"
              max="11"
            />
          </div>
        </div>
      )}
    </div>
  );
}
