FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app

COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared
RUN npm run build --workspace @declic/frontend

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/apps/frontend/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
