import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const checkboxId = id || `cb-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className="w-4 h-4 rounded text-toyota-red border-neutral-300 focus:ring-toyota-red focus:ring-1 cursor-pointer accent-toyota-red"
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className="text-xs text-neutral-700 cursor-pointer font-normal leading-tight"
        >
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
