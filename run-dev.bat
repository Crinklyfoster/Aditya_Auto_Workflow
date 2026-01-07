@echo off
title Aditya Auto Workflow - Dev Runner

echo ==========================================
echo Starting Aditya Auto Workflow (DEMO MODE)
echo ==========================================

REM ---------- BACKEND ----------
start "Backend - Django API" powershell ^
  -NoExit ^
  -WorkingDirectory "%~dp0backend" ^
  -Command ".\venv\Scripts\Activate.ps1; python manage.py runserver"

REM ---------- FRONTEND ----------
start "Frontend - Next.js UI" powershell ^
  -NoExit ^
  -WorkingDirectory "%~dp0frontend" ^
  -Command "npm run dev"

echo.
echo Servers launched successfully:
echo   Backend  -> http://127.0.0.1:8000
echo   Frontend -> http://localhost:3000
echo.
echo Close the opened windows to stop servers.
echo ==========================================
