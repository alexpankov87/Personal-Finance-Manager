import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <div style={{ marginBottom: '10px' }}>
      {label && <label style={{ display: 'block', marginBottom: '5px' }}>{label}</label>}
      <input
        {...props}
        style={{
          width: '100%',
          padding: '8px',
          border: `1px solid ${error ? '#dc2626' : 'var(--border-color)'}`,
          borderRadius: '6px',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          ...props.style,
        }}
      />
      {error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
    </div>
  );
};

export default Input;