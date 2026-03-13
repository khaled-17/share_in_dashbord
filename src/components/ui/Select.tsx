import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  fullWidth?: boolean;
  onAddClick?: () => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = false,
  className = "",
  id,
  onAddClick,
  onChange,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const currentValue = props.value?.toString() ?? "";
  const hasEmptyOption = options.some(
    (option) => option.value.toString() === "",
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "ADD_NEW" && onAddClick) {
      onAddClick();
      // Reset the selection to prevent it from staying on "ADD_NEW"
      e.target.value = currentValue;
      return;
    }
    if (onChange) {
      onChange(e);
    }
  };

  const finalOptions = [
    ...(currentValue === "" && !hasEmptyOption
      ? [{ value: "", label: "اختر من القائمة" }]
      : []),
    ...options,
    ...(onAddClick ? [{ value: "ADD_NEW", label: "➕ إضافة جديد" }] : []),
  ];

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`input-field ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
        onChange={handleChange}
        {...props}
      >
        {finalOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
