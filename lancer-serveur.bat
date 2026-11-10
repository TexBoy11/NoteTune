@echo off
cd /d "%~dp0"
echo Demarrage du serveur dans :
echo %CD%
echo.
start "Serveur Accordeur" cmd /k "cd /d %~dp0 && python -m http.server 8000"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8000/"
echo La page est ouverte sur http://127.0.0.1:8000/
echo Pour arreter le serveur, fermez la fenetre Serveur Accordeur.
