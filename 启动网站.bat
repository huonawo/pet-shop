@echo off
title 萌宠小店 - 开发服务器
color 0B

echo.
echo  ========================================
echo   🐾 萌宠小店 - 启动开发服务器
echo  ========================================
echo.

cd /d "%~dp0"

echo [1/2] 检查依赖安装...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install
)

echo.
echo [2/2] 启动开发服务器...
echo 浏览器将自动打开 http://localhost:5173/
echo 按 Ctrl+C 可停止服务器
echo.

start http://localhost:5173/
npm run dev -- --host

pause
