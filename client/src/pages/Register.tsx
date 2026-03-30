import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError(t('registerError', { defaultValue: 'Ошибка регистрации. Возможно, email уже используется.' }));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>{t('register', { defaultValue: 'Регистрация' })}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t('name', { defaultValue: 'Имя' })}
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input
          type="email"
          placeholder={t('email', { defaultValue: 'Электронная почта' })}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input
          type="password"
          placeholder={t('password', { defaultValue: 'Пароль' })}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '8px' }}>
          {t('registerButton', { defaultValue: 'Зарегистрироваться' })}
        </button>
      </form>
      <p style={{ marginTop: '10px' }}>
        {t('haveAccount', { defaultValue: 'Уже есть аккаунт?' })} <Link to="/login">{t('login', { defaultValue: 'Войти' })}</Link>
      </p>
    </div>
  );
};

export default Register;