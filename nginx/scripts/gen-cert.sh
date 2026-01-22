#!/bin/sh
set -eu

apk add --no-cache openssl >/dev/null 2>&1

mkdir -p /certs

# 既にあれば何もしない
if [ -f /certs/server.crt ] && [ -f /certs/server.key ]; then
  echo "[cert-init] cert already exists"
  ls -la /certs
  exit 0
fi

echo "[cert-init] generating cert..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /certs/server.key \
  -out /certs/server.crt \
  -subj "/CN=10.96.22.128"

echo "[cert-init] done"
ls -la /certs
