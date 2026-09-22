@echo off
echo Starting Seatly (production mode)...
echo.
echo Installing backend dependencies...
pip install -r requirements.txt
echo.
echo Building frontend...
pushd frontend
call npm install
call npm run build
popd
echo.
echo Stopping any existing server instances...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq FastAPI Server*" 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting FastAPI server (serving the built frontend)...
start "FastAPI Server" python main.py
timeout /t 4 /nobreak >nul
start http://localhost:8000
echo.
echo Server is running in a separate window.
echo Browser has been opened to http://localhost:8000
echo.
echo To stop the server, close the "FastAPI Server" window.
echo.
echo For active frontend development with hot-reload, use run_dev.bat instead.
echo.
pause
