# AI Assistant Module

A minimal but functional micro-project that simulates an internal "AI assistant module" for processing tasks, generating responses, and logging interactions.

## 🚀 Features

- **Task Processing**: Submit tasks and receive structured AI-generated responses
- **Interaction Logging**: All interactions are saved to SQLite database
- **RESTful API**: Clean Express.js API with Swagger documentation
- **CLI Interface**: Interactive command-line interface for testing
- **Health Monitoring**: Built-in health check endpoints
- **Modular Architecture**: Clean separation of concerns with TypeScript
- **Vercel Ready**: Configured for easy deployment to Vercel

## 🏗️ Architecture

```
src/
├── types/           # TypeScript interfaces and types
├── database/        # SQLite database service and schema
├── services/        # AI service for task processing
├── routes/          # Express API routes
├── config/          # Configuration files (Swagger)
├── cli/             # Command-line interface
└── index.ts         # Main application entry point
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (optional - runs in simulation mode without it)

## 🛠️ Installation

1. **Clone and navigate to the project:**
   ```bash
   cd stanis
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   DATABASE_PATH=./data/assistant.db
   ```

4. **Create data directory:**
   ```bash
   mkdir -p data
   ```

## 🚀 Running the Application

### Full Stack Development (Recommended)
```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Run both backend and frontend servers
npm run dev:full
```

**Port Configuration:**
- **Backend API**: http://localhost:3000 (Express + TypeScript)
- **Frontend React**: http://localhost:3001 (React + Tailwind CSS)
- **API Documentation**: http://localhost:3000/api-docs (Swagger UI)

**Alternative Start Methods:**
```bash
# Using the startup script (includes port checks)
npm run start:dev

# Or manually test ports
node test-ports.js
```

### Backend Only
```bash
npm run dev
```

### Frontend Only
```bash
npm run frontend
```

### Production Mode
```bash
npm run build:all
npm start
```

### CLI Interface
```bash
npm run dev:watch
# Then in another terminal:
npx ts-node src/cli/index.ts
```

## 🎨 Frontend Features

The React frontend provides a beautiful, ChatGPT-like interface with:

- **Modern UI**: Clean design with Tailwind CSS
- **Real-time Chat**: Interactive conversation interface
- **Typing Animation**: ChatGPT-style response animation
- **Loading States**: Dynamic loading indicators
- **Task Management**: View history, statistics, and manage logs
- **Responsive Design**: Works on desktop and mobile
- **Real-time Status**: Connection and health monitoring

### Frontend Access
- **React App**: http://localhost:3001
- **Backend API**: http://localhost:3000

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **API JSON**: http://localhost:3000/api-docs.json

## 🔌 API Endpoints

### Tasks
- `POST /api/tasks/process` - Process a new task
- `GET /api/tasks/logs` - Get interaction logs (with pagination)
- `GET /api/tasks/logs/:id` - Get specific interaction log
- `GET /api/tasks/stats` - Get task processing statistics

### Health
- `GET /api/health` - Health check endpoint

## 💡 Usage Examples

### 1. Process a Task via API

```bash
curl -X POST http://localhost:3000/api/tasks/process \
  -H "Content-Type: application/json" \
  -d '{
    "task": "analyze leads",
    "context": "Q4 sales data",
    "priority": "high"
  }'
```

### 2. Get Interaction Logs

```bash
curl http://localhost:3000/api/tasks/logs?limit=10&offset=0
```

### 3. Check Health Status

```bash
curl http://localhost:3000/api/health
```

### 4. CLI Interface Commands

```bash
# Start CLI
npx ts-node src/cli/index.ts

# Available commands:
> analyze leads                    # Process a task
> summarize calls                  # Process another task
> logs                           # View recent logs
> stats                          # Show statistics
> help                           # Show help
> exit                           # Quit
```

## 🎯 Task Examples

The AI assistant is optimized for business tasks:

- **"analyze leads"** - Generates lead analysis reports
- **"summarize calls"** - Creates call summary reports  
- **"update client report"** - Updates client status reports
- **"create marketing strategy"** - Develops marketing plans
- **"review sales performance"** - Analyzes sales metrics

## 🗄️ Database Schema

The SQLite database stores interaction logs with the following structure:

```sql
CREATE TABLE interaction_logs (
  id TEXT PRIMARY KEY,
  task TEXT NOT NULL,
  response TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  timestamp TEXT NOT NULL,
  processing_time INTEGER NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  metadata TEXT
);
```

## 🚀 Deployment to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel dashboard:**
   - `OPENAI_API_KEY`
   - `NODE_ENV=production`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI responses | Required for real AI |
| `PORT` | Backend server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `DATABASE_PATH` | SQLite database file path | ./data/assistant.db |

### Port Configuration

The application is configured to run on different ports to avoid conflicts:

- **Backend (Express API)**: Port 3000
- **Frontend (React App)**: Port 3001
- **API Proxy**: Frontend automatically proxies API calls to backend

**Port Configuration Files:**
- Backend: `src/index.ts` (PORT=3000)
- Frontend: `frontend/package.json` (PORT=3001)
- Frontend: `frontend/env.local` (PORT=3001)
- Proxy: `frontend/package.json` (proxy: "http://localhost:3000")

### Simulation Mode

If no OpenAI API key is provided, the application runs in simulation mode with pre-built responses for common business tasks.

## 🧪 Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Visit http://localhost:3000/api-docs
3. Use the Swagger UI to test endpoints
4. Or use the CLI: `npx ts-node src/cli/index.ts`

### Example Test Flow
```bash
# 1. Check health
curl http://localhost:3000/api/health

# 2. Process a task
curl -X POST http://localhost:3000/api/tasks/process \
  -H "Content-Type: application/json" \
  -d '{"task": "analyze leads"}'

# 3. View logs
curl http://localhost:3000/api/tasks/logs

# 4. Check stats
curl http://localhost:3000/api/tasks/stats
```

## 📊 Monitoring

The application includes built-in monitoring:

- **Health Check**: `/api/health` endpoint
- **Statistics**: Task processing metrics
- **Logging**: All interactions are logged
- **Error Handling**: Comprehensive error responses

## 🏆 Key Features Demonstrated

✅ **Clean, modular, maintainable code**  
✅ **Logical flow and minimal documentation**  
✅ **Completion within ~2 hours**  
✅ **Independent decisions**  
✅ **Basic understanding of async processes**  
✅ **Professional API with Swagger documentation**  
✅ **Database integration with SQLite**  
✅ **CLI interface for testing**  
✅ **Vercel deployment ready**  

## 🤝 Contributing

This is an assessment project. The codebase demonstrates:

- TypeScript best practices
- Express.js API development
- Database design and integration
- API documentation with Swagger
- CLI application development
- Deployment configuration

## 📄 License

MIT License - Assessment Project
