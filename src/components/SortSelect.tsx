type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export default function SortSelect({ options, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: 8 }}
    >
      <option value="">Sort by...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}