@echo off
echo ============================================
echo   萌宠小店 - Cloudflare Pages 部署脚本
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] 正在安装依赖...
call npm install

echo.
echo [2/3] 正在构建项目...
call npm run build

echo.
echo [3/3] 正在部署到 Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=pet-shop

echo.
echo ============================================
echo   部署完成！
echo ============================================
pause
