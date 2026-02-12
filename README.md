# Debt CRM

RU | [EN](#en)

## RU

Debt CRM - pet-проект CRM-системы для работы с должниками.  
Приложение помогает вести список должников, рассчитывать проценты, фиксировать платежи и закрывать задолженности.

### Что умеет приложение

- Управление должниками: создание, просмотр, фильтрация, сортировка, поиск
- Автоматический расчет процентов и итоговой задолженности
- Учет платежей по каждому должнику
- Закрытие и удаление закрытых должников
- Мультивыбор для массовых операций
- Локализация интерфейса: русский, английский, корейский, японский
- Автоподбор темы (light/dark) и языка по браузеру
- Адаптивный mobile-first интерфейс на Element Plus
- Анимированный фон и skeleton-загрузчики

### Технический стек

- Vue 3 + TypeScript
- Vite
- Pinia
- Vue Router
- Element Plus + `@element-plus/icons-vue`
- Django 5 + Django REST Framework
- PostgreSQL
- Docker + Docker Compose
- `django-cors-headers`
- Vitest (unit-тесты)
- ESLint + Prettier

### Архитектура

- `src/views` - экранные компоненты (`DebtorsView`, `DebtorDetailsView`)
- `src/components` - переиспользуемые UI-компоненты:
  - `buttons`
  - `inputs`
  - `tables`
  - `common` (card, alert, status и т.д.)
- `src/stores` - состояние приложения (Pinia)
- `src/services` - API-слой
- `src/domain` - доменная логика (расчеты)
- `src/styles` - вынесенные стили по модулям
- `src/i18n` - локализация
- `backend/` - Django REST API (слой данных и бизнес-логики)

### Скрипты

```bash
npm install
npm run dev
npm run type-check
npm run test:unit -- --run
npm run build
```

### Backend и Docker

Проект переведен с mock server на реальный backend:

- Django REST API: `backend/`
- PostgreSQL
- `docker-compose.yml` в корне

Запуск всего стека:

```bash
docker compose up --build
```

После запуска:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Django Admin: `http://localhost:8000/admin`

Горячая перезагрузка фронтенда в Docker включена через polling
(`CHOKIDAR_USEPOLLING=true` в `docker-compose.yml`).

### Качество и тестирование

- Покрыты юнит-тестами ключевые части:
  - вычисления процентов
  - форматирование
  - i18n
  - theme preference
  - store/API
- Добавлены backend-тесты Django:
  - API-тесты (`backend/debtors/tests/test_api.py`)
  - service/domain-тесты (`backend/debtors/tests/test_services.py`)

### Дальнейшее развитие

- Подключение реального backend (REST/GraphQL)
- Авторизация и роли пользователей
- История изменений по должникам (audit trail)
- Экспорт отчетов (CSV/PDF)

---

## EN

Debt CRM is a pet CRM project focused on debtor management.  
It helps track debtors, calculate interest, record payments, and close debts.

### Features

- Debtor management: create, open, filter, sort, search
- Automatic interest and total debt calculations
- Payment tracking per debtor
- Close debtors and delete closed records
- Bulk actions via multi-select
- UI localization: Russian, English, Korean, Japanese
- Automatic light/dark theme and language detection from browser preferences
- Mobile-first responsive UI with Element Plus
- Animated background and skeleton loading states

### Tech stack

- Vue 3 + TypeScript
- Vite
- Pinia
- Vue Router
- Element Plus + `@element-plus/icons-vue`
- Django 5 + Django REST Framework
- PostgreSQL
- Docker + Docker Compose
- `django-cors-headers`
- Vitest (unit tests)
- ESLint + Prettier

### Architecture

- `src/views` - page-level screens (`DebtorsView`, `DebtorDetailsView`)
- `src/components` - reusable UI building blocks:
  - `buttons`
  - `inputs`
  - `tables`
  - `common` (card, alert, status, etc.)
- `src/stores` - application state (Pinia)
- `src/services` - API layer
- `src/domain` - domain logic (calculations)
- `src/styles` - modularized styles
- `src/i18n` - localization
- `backend/` - Django REST API (data and business logic layer)

### Scripts

```bash
npm install
npm run dev
npm run type-check
npm run test:unit -- --run
npm run build
```

### Backend and Docker

The project has been migrated from a mock server to a real backend:

- Django REST API in `backend/`
- PostgreSQL
- Root-level `docker-compose.yml`

Run the full stack:

```bash
docker compose up --build
```

After startup:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Django Admin: `http://localhost:8000/admin`

Frontend hot-reload in Docker is enabled via file polling
(`CHOKIDAR_USEPOLLING=true` in `docker-compose.yml`).

### Quality and testing

- Core logic is covered by unit tests:
  - debt calculations
  - formatting
  - i18n
  - theme preference
  - store/API
- Django backend tests are included:
  - API tests (`backend/debtors/tests/test_api.py`)
  - service/domain tests (`backend/debtors/tests/test_services.py`)

### Roadmap

- Integrate a real backend (REST/GraphQL)
- Add authentication and user roles
- Add debtor audit trail
- Add CSV/PDF reporting
