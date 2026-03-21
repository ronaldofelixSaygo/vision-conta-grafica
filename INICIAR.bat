@echo off
chcp 65001 >nul
title Vision - Conta Grafica - Servidor Web

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║   Vision - Módulo Conta Gráfica              ║
echo  ║   Servidor Web + SQL Server                  ║
echo  ╚══════════════════════════════════════════════╝
echo.

:: Verificar Node.js
where node >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERRO] Node.js não encontrado!
    echo Instale em: https://nodejs.org (versão LTS)
    pause & exit /b 1
)

:: Instalar dependências se necessário
IF NOT EXIST node_modules (
    echo [1/2] Instalando dependências...
    call npm install
    IF ERRORLEVEL 1 ( echo [ERRO] Falha ao instalar. & pause & exit /b 1 )
)

:: Verificar .env
IF NOT EXIST .env (
    echo [AVISO] Arquivo .env não encontrado! Criando padrão...
    copy .env.example .env >nul 2>&1
    echo Edite o arquivo .env com as configurações do SQL Server antes de continuar.
    notepad .env
    pause
)

echo [2/2] Iniciando servidor...
echo.

:: Descobrir IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo  Acesso local:  http://localhost:3000
echo  Acesso rede:   http://%IP%:3000
echo.
echo  Pressione Ctrl+C para parar o servidor.
echo.

node server/index.js
pause
