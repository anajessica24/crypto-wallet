#!/bin/bash
# Dar permissão ao executável C
chmod +x backend/csrc/build/btc-wallet-c

# Rodar Flask via Gunicorn na porta 8000
gunicorn --bind=0.0.0.0:8000 app:app --workers=4
