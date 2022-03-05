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

# dns設定（yarn install で外部アクセスが必要）
COPY ./build-scripts/deps.sh ./
RUN chmod 744 deps.sh
RUN sh ./deps.sh

RUN cat resolv.conf > /etc/resolv.conf && yarn install --frozen-lockfile


##############################################################
# yarn build 用 のコンテナ
##############################################################
FROM node:17.6.0-slim AS builder
WORKDIR /app


COPY --from=deps /app/node_modules ./node_modules
COPY . .

# dns設定（yarn build でSSG用に外部アクセスが必要）
COPY ./etc/resolv.conf ./
RUN cat resolv.conf > /etc/resolv.conf && yarn build


##############################################################
# NextJS 実行用のコンテナ
##############################################################
FROM node:17.6.0-slim AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# build用のコンテナから必要なファイルをコピー
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# dns設定（node でSSR用に外部アクセスが必要）
COPY ./etc/resolv.conf ./
ENTRYPOINT ["cat","resolv.conf",">","/etc/resolv.conf"]

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
