import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, error, ...props }) => {
  return (
    <div style={{ marginBottom: '10px' }}>
      {label && <label style={{ display: 'block', marginBottom: '5px' }}>{label}</label>}
      <select
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
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
    </div>
  );
};

export default Select;