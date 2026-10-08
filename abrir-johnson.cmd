@echo off
cd /d "%~dp0"
node server\local-server.js --open
if errorlevel 1 pause
