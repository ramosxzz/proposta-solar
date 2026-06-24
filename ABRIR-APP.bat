@echo off
setlocal
cd /d "%~dp0"
title Proposta Solar
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-app.ps1"
if errorlevel 1 (
  echo.
  echo Nao foi possivel iniciar o aplicativo.
  pause
)
endlocal
