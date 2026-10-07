import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline-red' | 'outline-gray' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-2.5',
  };

  const variantStyles = {
    primary:
      'bg-toyota-red text-white hover:bg-toyota-darkRed focus:ring-toyota-red border border-transparent shadow-sm',
    'outline-red':
      'border border-toyota-red text-toyota-red hover:bg-toyota-red hover:text-white focus:ring-toyota-red bg-white',
    'outline-gray':
      'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 focus:ring-neutral-400 bg-white',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
