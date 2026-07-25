@echo off
title LAWRAQ Offline Demo
cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo LAWRAQ needs its local packages once before the offline demo can start.
  echo Run: npm install
  pause
  exit /b 1
)

if not exist "dist\tour\index.html" (
  echo Preparing the offline demo...
  call npm run build
  if errorlevel 1 (
    echo The offline build could not be prepared.
    pause
    exit /b 1
  )
)

start "" /min powershell.exe -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:4173/tour/'"
call npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
