@echo off
title GameRank - Ranking Personal de Videojuegos & Duelos 1v1
echo ======================================================
echo   Iniciando GameRank...
echo ======================================================
echo.

cd /d "%~dp0"

echo [1/2] Abriendo navegador en http://localhost:3000 ...
start http://localhost:3000

echo [2/2] Iniciando servidor local en el puerto 3000...
echo.
echo Presiona Ctrl + C o cierra esta ventana cuando desees apagar la aplicacion.
echo.

deno run -A npm:vite preview --port 3000 --host

pause
