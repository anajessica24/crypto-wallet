#!/bin/bash
# Comando para iniciar a aplicação com Gunicorn
gunicorn --bind=0.0.0.0 --workers=4 backend.pysrc.app:app
chmod +x backend/csrc/build/btc-wallet-c
gunicorn --bind=0.0.0.0:8000 app:app