'use client';

import React, { useState, forwardRef } from 'react';

export interface FloatingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  error?: string;
  helperText?: string;
  endAdornment?: React.ReactNode;
  icon?: React.ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      error,
      helperText,
      endAdornment,
      icon,
      value,
      defaultValue,
      className = '',
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasValue =
      (value !== undefined && value !== null && String(value).length > 0) ||
      (defaultValue !== undefined && defaultValue !== null && String(defaultValue).length > 0);

    const isFloating = isFocused || Boolean(hasValue);
    const inputId = id || props.name || label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <input
            {...props}
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            placeholder=" "
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={`peer block w-full rounded-lg bg-white border text-neutral-900 text-sm transition-all duration-200 outline-none ${
              icon ? 'pl-10' : 'pl-3.5'
            } ${endAdornment ? 'pr-11' : 'pr-3.5'} pt-3.5 pb-2.5 ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                : isFocused
                ? 'border-toyota-red ring-1 ring-toyota-red'
                : 'border-neutral-300 hover:border-neutral-400'
            } ${className}`}
          />

          <label
            htmlFor={inputId}
            className={`absolute z-10 transition-all duration-200 ease-out pointer-events-none select-none origin-left ${
              icon && !isFloating ? 'left-10' : 'left-3'
            } ${
              isFloating
                ? '-top-2.5 text-xs font-semibold px-1.5 bg-white scale-90 ' +
                  (error
                    ? 'text-red-600'
                    : isFocused
                    ? 'text-toyota-red'
                    : 'text-neutral-600')
                : 'top-3 text-sm text-neutral-400'
            } peer-focus:-top-2.5 peer-focus:text-xs peer-focus:scale-90 peer-focus:font-semibold peer-focus:px-1.5 peer-focus:bg-white ${
              error ? 'peer-focus:text-red-600' : 'peer-focus:text-toyota-red'
            } peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:scale-90 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:bg-white`}
          >
            {label}
          </label>

          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10 text-neutral-400">
              {endAdornment}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-[11px] text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
export default FloatingInput;
