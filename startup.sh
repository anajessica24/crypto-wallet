#!/bin/bash
# Dar permissão ao executável C
chmod +x backend/csrc/build/btc-wallet-c

# Iniciar o Flask via Gunicorn na porta 8000
gunicorn --bind=0.0.0.0:8000 backend.pysrc.app:app --workers=4
