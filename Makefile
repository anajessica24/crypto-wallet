run-backend:
	# Usa o Python do virtualenv diretamente, garantindo ativação
	backend/venv/bin/python backend/pysrc/app.py

build-c:
	$(MAKE) -C backend/csrc

run-frontend:
	cd frontend && python3 -m http.server 3000

run:
	# -j2 executa 2 comandos em paralelo
	# Usa 'wait' para manter ambos rodando
	$(MAKE) -j2 run-backend run-frontend

#using chatgpt to run the backend with the frontend together