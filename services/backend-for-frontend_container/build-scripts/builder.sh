#!/bin/sh

# dns設定（yarn build でSSG用に外部アクセスが必要）
cat resolv.conf > /etc/resolv.conf

# buildの実行
yarn build