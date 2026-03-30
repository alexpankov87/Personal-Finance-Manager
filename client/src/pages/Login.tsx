import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(t('invalidCredentials', { defaultValue: 'Неверный email или пароль' }));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>{t('login', { defaultValue: 'Вход' })}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
          {t('loginButton', { defaultValue: 'Войти' })}
        </button>
      </form>
      <p style={{ marginTop: '10px' }}>
        {t('noAccount', { defaultValue: 'Нет аккаунта?' })} <Link to="/register">{t('register', { defaultValue: 'Зарегистрироваться' })}</Link>
      </p>
    </div>
  );
};

export default Login;