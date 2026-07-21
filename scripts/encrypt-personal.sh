#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d personal ]; then
  echo "personal/ folder not found — nothing to encrypt."
  exit 1
fi

tar -cf personal.tar personal
gpg --symmetric --cipher-algo AES256 --pinentry-mode loopback -o personal.tar.gpg personal.tar
rm -f personal.tar

echo "Encrypted personal/ -> personal.tar.gpg"
echo "Now run: git add personal.tar.gpg && git commit -m 'Update encrypted personal archive'"
