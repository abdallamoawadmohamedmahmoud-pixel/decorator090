@echo off
echo ========================================
echo  .prepare Decorator Site for Upload
echo ========================================
echo.

echo Creating ZIP file for Netlify upload...
powershell -Command "Compress-Archive -Path '.\index.html', '.\login.html', '.\register.html', '.\contact.html', '.\about.html', '.\services.html', '.\portfolio.html', '.\packages.html', '.\owner_dashboard.html', '.\forgot-password.html', '.\whatsapp-direct.html', '.\404.html', '.\500.html', '.\confirm-email.html', '.\user_dashboard.html', '.\netlify.toml', '.\package.json', '.\README.md', '.\css\*', '.\uploads\*', '.\netlify\*', '.\data\*' -DestinationPath '.\decorator-site.zip' -Force"

echo.
echo ========================================
echo Done! Upload decorator-site.zip to:
echo https://app.netlify.com/drop
echo.
echo After upload:
echo 1. Go to Site Settings
echo 2. Go to Environment Variables
echo 3. Add:
echo    OWNER_EMAIL = ramadan.nady1985@gmail.com
echo    OWNER_PASSWORD = 01099797984
echo ========================================
pause
