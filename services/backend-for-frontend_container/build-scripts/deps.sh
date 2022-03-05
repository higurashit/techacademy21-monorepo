#!/bin/sh

# dns設定（yarn install で外部アクセスが必要）
cat resolv.conf > /etc/resolv.conf

# installの実行
yarn install --frozen-lockfile
