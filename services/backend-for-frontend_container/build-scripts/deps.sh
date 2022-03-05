#!/bin/sh
cat resolv.conf > /etc/resolv.conf

yarn install --frozen-lockfile
