#!/bin/bash

echo "🚀 Starting AI Assistant Module - Full Stack Development"
echo "========================================================"

# Check if ports are available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 3000 is already in use. Please stop the process using this port."
    exit 1
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 3001 is already in use. Please stop the process using this port."
    exit 1
fi

echo "✅ Ports 3000 and 3001 are available"
echo ""
echo "📡 Backend will run on: http://localhost:3000"
echo "🎨 Frontend will run on: http://localhost:3001"
echo "📚 API Documentation: http://localhost:3000/api-docs"
echo ""
echo "Starting servers..."

# Start both servers
npm run dev:full
