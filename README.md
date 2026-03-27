# Personal Finance Manager 💰

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.0-green?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?logo=jsonwebtokens)
![Recharts](https://img.shields.io/badge/Recharts-2.0-blue?logo=chartdotjs)
![i18next](https://img.shields.io/badge/i18next-23.0-blue?logo=i18next)
![Vite](https://img.shields.io/badge/Vite-5.0-yellow?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

> Приложение для контроля финансов с аналитикой и прогнозированием бюджета.

Позволяет:
— видеть, куда уходят деньги
— прогнозировать расходы
— управлять финансами как в банковском приложении

## 💡 Ключевые возможности

— Прогноз бюджета на основе истории и инфляции  
— Автоматизация повторяющихся операций (cron)  
— Поддержка нескольких языков и тем  
— Экспорт данных (CSV / PDF)  
## 🌐 Демо

Живая версия приложения:  
👉 [**Personal Finance Manager**](https://personal-finance-manager-two.vercel.app)

### 🔐 Тестовый вход

Вы можете войти с тестовым аккаунтом:

- **Email:** `demo@demo.com`
- **Пароль:** `demo123`

Или зарегистрировать собственного пользователя.

> ℹ️ Тестовый аккаунт используется для демонстрации. Все данные в нём могут быть изменены другими пользователями. 
---

### 🔑 Доступ

Для тестирования приложения **зарегистрируйтесь** через форму регистрации.  
Все данные изолированы между пользователями.

## 📋 Оглавление

- [Описание](#описание)
- [Стек технологий](#стек-технологий)
- [Функциональность](#функциональность)
- [Установка и запуск](#установка-и-запуск)
- [API Эндпоинты](#api-эндпоинты)
- [Лицензия](#лицензия)
---

## 🚀 Описание

**Personal Finance Manager** — это веб-приложение для учёта доходов и расходов. Позволяет создавать категории, добавлять транзакции, настраивать повторяющиеся операции, анализировать бюджет с помощью графиков, прогнозировать расходы и экспортировать данные в CSV/PDF.

Приложение поддерживает **3 языка** (русский, английский, казахский), **кастомные темы** (светлая, тёмная, серая, синяя) и полностью **адаптивно** для мобильных устройств.


---
## 🧠 Инженерные решения

— Использовал кастомные хуки для переиспользования логики и упрощения компонентов  
— Реализовал централизованную обработку ошибок через ErrorBoundary  
— Разделил клиентскую и серверную ответственность (SPA + REST API)  
— Настроил JWT-авторизацию с изоляцией данных пользователей  
— Оптимизировал рендеринг и структуру компонентов  

## 🛠 Стек технологий

### **Клиент**
- **React 19** + **TypeScript**
- **Vite** — сборка
- **React Router DOM** — маршрутизация
- **i18next** — интернационализация
- **Recharts** — графики
- **RemixIcon** — иконки
- **Papaparse** — экспорт CSV
- **react-hot-toast** — уведомления
- **react-modal** — модальные окна

### **Сервер**
- **Node.js 20** + **Express**
- **TypeScript**
- **MongoDB Atlas** + **Mongoose**
- **JWT** — авторизация
- **bcryptjs** — хеширование паролей
- **node-cron** — повторяющиеся операции
- **pdfkit** — генерация PDF

---

## 📦 Установка и запуск

### **Требования**
- Node.js 20+
- MongoDB (локально или Atlas)

### **1. Клонирование репозитория**
``bash

git clone https://github.com/alexpankov87/Personal-Finance-Manager.git

cd Personal-Finance-Manager

**2. Настройка сервера**

cd server

cp .env.example .env

### **Отредактируйте** .env (MONGO_URI, JWT_SECRET, PORT)

npm install

npm run dev

### **3. Настройка клиента**

cd client

cp .env.example .env

# **Отредактируйте** .env (VITE_API_URL)

npm install

npm run dev

Приложение будет доступно по адресу http://localhost:5173

🔧 **Переменные окружения**

### Сервер (server/.env)

.env

MONGO_URI=mongodb://localhost:27017/finance

JWT_SECRET=dev-secret-key

PORT=5001

FRONTEND_URL=http://localhost:5173

Клиент (client/.env)

.env

VITE_API_URL=http://localhost:5001/api

🚀 **Деплой**

### **Сервер (Render)**

Создайте аккаунт на render.com

Нажмите New + → Web Service

Подключите GitHub репозиторий

### **Настройки:**

Root Directory: server

Build Command: npm install && npm run build

Start Command: npm start

### **Добавьте переменные окружения:**

MONGO_URI – строка из MongoDB Atlas

JWT_SECRET – сгенерируйте: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

FRONTEND_URL – URL вашего фронтенда (после деплоя клиента)

### **Клиент (Vercel)**
Создайте аккаунт на vercel.com

Нажмите Add New... → Project

Импортируйте GitHub репозиторий

### Настройки:

Root Directory: client

Build Command: npm run build

Output Directory: dist

### Добавьте переменную окружения:

VITE_API_URL – URL вашего сервера на Render (например, https://your-api.onrender.com/api)

👨‍💻 Автор
**Alex Pankov**


## **Что нужно сделать:**

 ### 1. **Создайте файлы `.env.example`** (если ещё нет):
   - `server/.env.example`
   - `client/.env.example`

### 2. **Проверьте, что в `.gitignore` добавлены:**
.env

.env.local

.env.production

### 3. **Закоммитьте изменения:**

git add .

git commit -m "docs: update README with installation and deployment instructions"

git push

**Важно для локальной установки:**

**После того как пользователь склонирует репозиторий, ему нужно:**

Скопировать .env.example в .env в обеих папках

Установить зависимости npm install

Запустить MongoDB локально или указать Atlas в .env

Запустить сервер и клиент

Всё должно работать без ошибок.
