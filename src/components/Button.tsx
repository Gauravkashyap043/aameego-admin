import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: '#3B36FF',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: '#fff',
    color: '#3B36FF',
    border: '1.5px solid #3B36FF',
  },
  danger: {
    background: '#FF3B3B',
    color: '#fff',
    border: 'none',
  },
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...variantStyles[variant],
        opacity: disabled ? 0.6 : 1,
        borderRadius: 8,
        padding: '10px 24px',
        fontWeight: 600,
        fontSize: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : undefined,
        marginRight: 8,
      }}
    >
      {children}
    </button>
  );
};

export default Button; 