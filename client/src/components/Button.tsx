import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' };
      case 'danger':
        return { backgroundColor: '#dc2626', color: 'white' };
      case 'icon':
        return { background: 'none', padding: '4px' };
      default:
        return {};
    }
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      style={{
        ...getVariantStyles(),
        opacity: isLoading ? 0.7 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        ...props.style,
      }}
    >
      {isLoading ? '⏳' : children}
    </button>
  );
};

export default Button;