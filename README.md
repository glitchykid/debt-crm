# Debt CRM

CRM-система для управления должниками. Стек: **Next.js 16 · Drizzle ORM · MUI v7 · Zod · PostgreSQL (Neon)**.

## Архитектура

```
src/
├── actions/          # Server Actions (граница БД → фронтенд)
├── lib/
│   ├── db/
│   │   ├── index.ts          # Подключение Drizzle + Neon
│   │   ├── schema.ts         # Схема таблиц
│   │   └── queries/          # Чистые DB-запросы
│   └── validators/
│       └── debtor.ts         # Zod-схемы + утилиты
├── components/       # MUI-компоненты (не знают о Drizzle)
├── app/              # Next.js App Router
└── __tests__/        # Jest + RTL тесты
```

### Слои

| Слой | Ответственность |
|---|---|
| `queries/` | Только SQL через Drizzle, без бизнес-логики |
| `validators/` | Zod-схемы, конвертация дат |
| `actions/` | Валидация → queries → revalidatePath |
| `components/` | MUI-рендеринг, вызов Server Actions |

## Запуск

```bash
cp .env.example .env.local
# Заполните DATABASE_URL

pnpm install
pnpm dev
```

## База данных

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Тесты

```bash
pnpm test
pnpm test:coverage
```
