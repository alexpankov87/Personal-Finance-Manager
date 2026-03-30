import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import 'flag-icons/css/flag-icons.min.css';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ['ru', 'en', 'kk'],
        fallbackLng: 'ru',
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie'],
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
        react: {
            useSuspense: false,
        },
        // Добавляем fallback-тексты, если файл не загрузился
        resources: {
            ru: {
                translation: {
                      login: "Вход",
                      loginButton: "Войти",
                      register: "Регистрация",
                      registerButton: "Зарегистрироваться",
                      registerError: "Ошибка регистрации. Возможно, email уже используется.",
                      email: "Электронная почта",
                      password: "Пароль",
                      name: "Имя",
                      noAccount: "Нет аккаунта?",
                      haveAccount: "Уже есть аккаунт?",
                      invalidCredentials: "Неверный email или пароль"
                  }
            },
            en: {
                translation: {
                    login: "Login",
                    loginButton: "Log in",
                    register: "Register",
                    registerButton: "Register",
                    email: "Email",
                    password: "Password",
                    noAccount: "No account?",
                    haveAccount: "Already have an account?",
                    invalidCredentials: "Invalid email or password"
                }
            },
            kk: {
                translation: {
                    login: "Кіру",
                    loginButton: "Кіру",
                    register: "Тіркелу",
                    registerButton: "Тіркелу",
                    email: "Электрондық пошта",
                    password: "Құпия сөз",
                    noAccount: "Аккаунт жоқ?",
                    haveAccount: "Аккаунт бар?",
                    invalidCredentials: "Қате email немесе құпия сөз"
                }
            }
        }
    });
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);