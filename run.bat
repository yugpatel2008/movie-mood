@echo off
echo ==============================================
echo        Starting MovieMood Servers
echo ==============================================

echo Starting Backend Server (FastAPI)...
start "MovieMood Backend" cmd /k "cd backend && venv\Scripts\uvicorn.exe app.main:app --reload"

echo Starting Frontend Server (React/Vite)...
start "MovieMood Frontend" cmd /k "cd frontend && npm run dev"

echo Servers are launching in separate windows!
echo Backend will be at http://localhost:8000
echo Frontend will be at http://localhost:5173
echo.
pause
