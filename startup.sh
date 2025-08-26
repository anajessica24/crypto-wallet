#!/bin/bash

# --- Caminhos ---
BACKEND_DIR="$(dirname "$0")/backend/pysrc"
CSRC_DIR="$(dirname "$0")/backend/csrc"
VENV_DIR="$BACKEND_DIR/venv"

# --- Ativar virtualenv ---
if [ -f "$VENV_DIR/bin/activate" ]; then
    echo "[info] Ativando venv..."
    source "$VENV_DIR/bin/activate"
else
    echo "[warn] venv não encontrado, criando..."
    python -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
    pip install -r "$BACKEND_DIR/requirements.txt"
fi

# --- Compilar executável C ---
cd "$CSRC_DIR"
make
chmod +x build/btc-wallet-c

# --- Rodar Gunicorn ---
cd "$BACKEND_DIR"
echo "[info] Rodando Gunicorn na porta ${PORT:-8000}..."
exec gunicorn --bind 0.0.0.0:$PORT app:app