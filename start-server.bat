@echo off
echo Starting Decorator Website Server...
echo.
echo Website will be available at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python -m http.server 8080 --bind 127.0.0.1
pause