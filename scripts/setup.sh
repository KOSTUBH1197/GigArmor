#!/bin/bash

# GigArmor Development Setup Script

echo "🚀 Setting up GigArmor development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB service."
    echo "   On macOS: brew services start mongodb/brew/mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    echo "   On Windows: net start MongoDB"
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "📦 Installing AI service dependencies..."
cd ../ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development servers:"
echo "1. Terminal 1 - Backend: cd backend && npm run dev"
echo "2. Terminal 2 - AI Service: cd ai-service && source venv/bin/activate && python main.py"
echo "3. Terminal 3 - Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "📚 API Documentation at: http://localhost:5000/api"
echo "🤖 AI Service at: http://localhost:8000"