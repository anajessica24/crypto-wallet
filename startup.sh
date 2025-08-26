#!/bin/bash
# Comando para iniciar a aplicação com Gunicorn
gunicorn --bind=0.0.0.0 --workers=4 backend.pysrc.app:app