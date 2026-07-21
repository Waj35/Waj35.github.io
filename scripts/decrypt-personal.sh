#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f personal.tar.gpg ]; then
  echo "personal.tar.gpg not found — nothing to decrypt."
  exit 1
fi

gpg --decrypt --pinentry-mode loopback -o personal.tar personal.tar.gpg
tar -xf personal.tar
rm -f personal.tar

echo "Decrypted personal.tar.gpg -> personal/"
