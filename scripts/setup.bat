@echo off
REM GigArmor Development Setup Script for Windows

echo 🚀 Setting up GigArmor development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo 📦 Installing AI service dependencies...
cd ai-service
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo ✅ Setup complete!
echo.
echo 🚀 To start the development servers:
echo 1. Terminal 1 - Backend: cd backend ^&^& npm run dev
echo 2. Terminal 2 - AI Service: cd ai-service ^&^& venv\Scripts\activate ^&^& python main.py
echo 3. Terminal 3 - Frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 Access the application at: http://localhost:3000
echo 📚 API Documentation at: http://localhost:5000/api
echo 🤖 AI Service at: http://localhost:8000

pause