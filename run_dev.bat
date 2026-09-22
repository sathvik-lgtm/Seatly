@echo off
echo Starting Seatly (dev mode: FastAPI + Vite, hot-reload)...
echo.
start "FastAPI Backend" cmd /k "pip install -r requirements.txt && python main.py"
timeout /t 3 /nobreak >nul
start "Vite Frontend" cmd /k "cd frontend && npm install && npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo.
echo Both servers are running in separate windows:
echo   - FastAPI backend:  http://localhost:8000
echo   - Vite frontend:    http://localhost:5173  (open this one in your browser)
echo.
echo Close both windows to stop.
echo.
pause
