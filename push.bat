@echo off
set "PATH=%LOCALAPPDATA%\MinGit\cmd;%PATH%"
echo ============================================================
echo Lumina Full-Stack Blog - GitHub Push Helper
echo ============================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (or press Enter to use existing origin): "
if not "%REPO_URL%"=="" (
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
)
git branch -M main
git push -u origin main
echo.
echo ============================================================
echo Push complete!
echo ============================================================
pause
