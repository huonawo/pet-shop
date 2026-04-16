@echo off
chcp 65001 >nul
echo ========================================
echo   部署到 Cloudflare Pages
echo ========================================
echo.

echo [1/3] 构建项目...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/3] 准备部署...
echo.

echo [3/3] 使用 Wrangler 部署到 Cloudflare Pages...
echo.
echo 💡 提示：如果是首次部署，需要先运行以下命令：
echo    npm install -g wrangler
echo    wrangler login
echo.
echo 然后运行：
echo    npx wrangler pages deploy dist --project-name=pet-shop
echo.

pause
