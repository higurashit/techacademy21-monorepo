#!/bin/sh

# DNS設定の変更
cat resolv.conf > /etc/resolv.conf

# NextJSの実行
su nextjs --shell=/bin/bash
node server.js