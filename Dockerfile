# Базовый образ Node.js
FROM node:18-alpine AS base

# Установка pnpm
RUN npm install -g pnpm

# Слой для установки зависимостей
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Слой для сборки приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Генерация Prisma Client
RUN pnpm prisma generate
# Сборка приложения
RUN pnpm build

# Продакшн образ
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Задаём переменные окружения напрямую
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flatty?schema=public"
ENV NEXTAUTH_SECRET="your-secret-key"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXT_PUBLIC_API_URL="http://localhost:3000/api"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Копируем необходимые файлы из сборочного слоя
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Копируем package.json и pnpm-lock.yaml для установки production-зависимостей
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

EXPOSE 3000

# Запуск приложения. Если используется standalone output, убедитесь, что server.js существует,
# либо замените на команду запуска Next.js (например, "node server.js" или "next start").
CMD ["node", "server.js"]