import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateName = (name: string) => {
    if (!name) return 'Имя обязательно';
    if (name.length < 2) return 'Имя должно содержать минимум 2 символа';
    if (name.length > 50) return 'Имя не должно превышать 50 символов';
    if (!/^[a-zA-Zа-яА-ЯёЁ\s\-\.]+$/.test(name)) return 'Имя может содержать только буквы, пробелы, дефисы и точки';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) return 'Email обязателен';
    if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) return 'Введите корректный email';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Пароль обязателен';
    if (password.length < 6) return 'Пароль должен содержать минимум 6 символов';
    if (!/[a-zA-Z]/.test(password)) return 'Пароль должен содержать хотя бы одну букву';
    if (!/\d/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (nameError || emailError || passwordError) {
      setErrors({ name: nameError, email: emailError, password: passwordError });
      return;
    }

    setErrors({});
    setServerError('');
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setServerError('Ошибка регистрации. Возможно, email уже используется.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Регистрация</h2>
      {serverError && <p style={{ color: 'red' }}>{serverError}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.name && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0 0' }}>{errors.name}</p>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.email && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0 0' }}>{errors.email}</p>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.password && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0 0' }}>{errors.password}</p>}
        </div>
        <button type="submit" style={{ width: '100%', padding: '8px' }}>Зарегистрироваться</button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
};

export default Register;