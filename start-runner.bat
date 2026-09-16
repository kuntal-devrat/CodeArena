@echo off
title CodeArena Hardware Executor (Local Runner)
color 0b
echo =============================================================
echo        CodeArena Desktop Hardware Executor
echo    Direct Local Hardware Execution - Zero Server Cost
echo =============================================================
echo.
echo Checking runtime environment...
cd /d "%~dp0apps\desktop-runner"
start http://127.0.0.1:5001
npx tsx src/index.ts
pause
