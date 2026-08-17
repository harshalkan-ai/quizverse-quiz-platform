@echo off
echo ===================================================
echo   Quizverse Platform - Fullstack Dev Server
echo ===================================================
set "PATH=D:\Program Files\nodejs;D:\Program Files\Git\cmd;D:\Program Files\Git\bin;%PATH%"
echo Starting Backend API on http://localhost:5000 ...
start "Quizverse Backend [Port 5000]" cmd /k "cd /d ""%~dp0backend"" && node server.js"
timeout /t 2 >nul
echo Starting Frontend Client on http://localhost:5173 ...
start "Quizverse Frontend [Port 5173]" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"
echo.
echo ===================================================
echo   Servers running:
echo   - Web UI:    http://localhost:5173/
echo   - REST API:  http://localhost:5000/api
echo ===================================================
