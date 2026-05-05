.PHONY: start stop build logs

.PHONY: start stop build frontend backend logs

build:
	mvn -q -DskipTests clean package
	cd frontend && npm install --no-audit --no-fund

start: build
	@echo "Killing any process on port 8080..."
	@sudo fuser -k 8080/tcp || true
	@echo "Starting backend..."
	@nohup mvn -f ./pom.xml spring-boot:run > backend.log 2>&1 & echo $$! > backend.pid
	@echo "Waiting for backend (v3 api docs)..."
	@until curl -s http://localhost:8080/v3/api-docs >/dev/null 2>&1; do sleep 1; done
	@echo "Backend started."
	@echo "Starting frontend..."
	@(cd frontend && nohup npm run dev > ../frontend.log 2>&1 & echo $$! > ../frontend.pid)
	@sleep 1
	@echo "Frontend started. Backend log: backend.log, Frontend log: frontend.log"

stop:
	@if [ -f backend.pid ]; then kill `cat backend.pid` || true; rm -f backend.pid; fi
	@if [ -f frontend.pid ]; then kill `cat frontend.pid` || true; rm -f frontend.pid; fi
	@echo "Stopped processes (if any)."

logs:
	@echo "== Backend log (backend.log) =="; tail -n 200 -f backend.log &
	@echo "== Frontend log (frontend.log) =="; tail -n 200 -f frontend.log
