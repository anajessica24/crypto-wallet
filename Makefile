run-backend:
	source backend/venv/bin/activate && python backend/pysrc/app.py

build-c:
	$(MAKE) -C backend/csrc

run-frontend:
	cd frontend && python3 -m http.server 3000

run:
	make -j2 run-backend run-frontend
