export default function NutritionStat({
  label,
  value,
  unit,
  colorClass,
}: {
  label: string;
  value: number;
  unit: string;
  colorClass: string;
}) {
  return (
    <div className={`rounded-xl px-4 py-3 ${colorClass}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-2xl font-bold">
        {value} <span className="text-sm font-medium opacity-70">{unit}</span>
      </p>
    </div>
  );
}
