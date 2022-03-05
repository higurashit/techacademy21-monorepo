# BASE: https://github.com/vercel/next.js/blob/946f465a6e4aba2a2aeee8dd33666e64e9075449/examples/with-docker/Dockerfile
# 変更点
#   1. nodeのバージョンを17.6.0に（2022/3/5時点の最新）
#   2. dns設定の追加（WorkSpacesの/etc/resolv.confのままだと通信ができないため）
#   3. コメントの削除（見たい場合は上記のURLへ）

##############################################################
# yarn install 用 のコンテナ
#    実行コンテナを最小サイズにするために複数コンテナでbuildをしている
##############################################################
FROM node:17.6.0-slim AS deps
WORKDIR /app

COPY package.json yarn.lock ./
COPY build-scripts/resolv.conf build-scripts/deps.sh ./

# install実行
RUN chmod 744 deps.sh
RUN sh ./deps.sh


##############################################################
# yarn build 用 のコンテナ
##############################################################
FROM node:17.6.0-slim AS builder
WORKDIR /app


COPY --from=deps /app/node_modules ./node_modules
COPY build-scripts/resolv.conf build-scripts/builder.sh ./
COPY . .

# build実行
RUN chmod 744 builder.sh
RUN sh ./builder.sh


##############################################################
# NextJS 実行用のコンテナ
##############################################################
FROM node:17.6.0-slim AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY build-scripts/resolv.conf build-scripts/runner.sh ./

# build用のコンテナから必要なファイルをコピー
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

# NextJS実行
RUN chmod 744 builder.sh
CMD ["sh", "runner.sh"]
