@echo off
title Subir GameRank a GitHub
echo ==============================================
echo   Subiendo GameRank a tu repositorio GitHub...
echo ==============================================
echo.

set GIT_CMD="C:\Users\ffdd_\AppData\Local\GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe"

if exist %GIT_CMD% (
    %GIT_CMD% push -u origin main --force
) else (
    git push -u origin main --force
)

echo.
echo ==============================================
echo   Si no hubo errores, recarga la pagina de GitHub en tu navegador (F5).
echo ==============================================
pause
