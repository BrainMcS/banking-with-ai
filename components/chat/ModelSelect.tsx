import { models } from '@/lib/ai/models';

export function ModelSelect({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.label} - {model.description}
        </option>
      ))}
    </select>
  );
}