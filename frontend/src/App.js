import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, BarChart3, RefreshCw, Menu, Trash2 } from 'lucide-react';
import MessageBubble from './components/MessageBubble';
import TaskInput from './components/TaskInput';
import LoadingIndicator from './components/LoadingIndicator';
import Sidebar from './components/Sidebar';
import { taskAPI, healthAPI } from './services/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentView, setCurrentView] = useState('chat');
  const [logs, setLogs] = useState([]);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check connection and load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check health
        const healthResponse = await healthAPI.checkHealth();
        setIsConnected(healthResponse.data.status === 'healthy');

        // Load stats
        const statsResponse = await taskAPI.getStats();
        setStats(statsResponse.data);

        // Load recent logs
        const logsResponse = await taskAPI.getLogs(10);
        setLogs(logsResponse.data);

        // Convert logs to messages for display
        const initialMessages = logsResponse.data.flatMap(log => [
          // User message
          {
            id: `${log.id}-user`,
            text: log.task,
            timestamp: log.timestamp,
            isUser: true
          },
          // AI response message
          {
            id: log.id,
            text: log.task,
            response: log.response,
            timestamp: log.timestamp,
            processingTime: log.processingTime,
            status: log.status,
            isUser: false
          }
        ]);

        setMessages(initialMessages);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsConnected(false);
      }
    };

    initializeApp();
  }, []);

  const handleSendMessage = async (taskData) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: taskData.task,
      timestamp: new Date().toISOString(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await taskAPI.processTask(taskData);
      
      // Add AI response
      const aiMessage = {
        id: response.data.id,
        text: taskData.task,
        response: response.data.response,
        timestamp: response.data.timestamp,
        processingTime: response.data.processingTime,
        status: response.data.status,
        isUser: false,
        isTyping: true
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update stats
      const statsResponse = await taskAPI.getStats();
      setStats(statsResponse.data);

    } catch (error) {
      console.error('Error processing task:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now(),
        text: taskData.task,
        response: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        status: 'error',
        isUser: false
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypingComplete = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTyping: false } : msg
    ));
  };

  const handleClearChat = () => {
    setMessages([]);
    setLogs([]);
  };

  const handleViewStats = () => {
    setCurrentView('stats');
    setShowSidebar(false);
  };

  const handleViewLogs = () => {
    setCurrentView('logs');
    setShowSidebar(false);
  };

  const handleViewChat = () => {
    setCurrentView('chat');
    setShowSidebar(false);
  };

  const handleClearAllLogs = async () => {
    setIsClearing(true);
    try {
      await taskAPI.deleteAllLogs();
      setMessages([]);
      setLogs([]);
      setShowClearModal(false);
      setShowSidebar(false);
      
      // Refresh stats
      const statsResponse = await taskAPI.getStats();
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Failed to clear logs. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const [statsResponse, logsResponse] = await Promise.all([
        taskAPI.getStats(),
        taskAPI.getLogs(50)
      ]);
      
      setStats(statsResponse.data);
      setLogs(logsResponse.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const renderStats = () => (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Statistics Dashboard
          </h2>
          <p className="text-gray-600 mt-2">Real-time performance metrics and insights</p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="stat-card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Total Tasks</p>
                <p className="text-3xl font-bold text-primary-800">{stats.totalInteractions}</p>
                <p className="text-xs text-primary-600">All time</p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-success-50 to-success-100 border-success-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700">Success Rate</p>
                <p className="text-3xl font-bold text-success-800">{stats.successRate.toFixed(1)}%</p>
                <p className="text-xs text-success-600">Reliability</p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center shadow-lg">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-warning-700">Avg. Processing Time</p>
                <p className="text-3xl font-bold text-warning-800">{stats.averageProcessingTime.toFixed(0)}ms</p>
                <p className="text-xs text-warning-600">Performance</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
          <p className="text-lg text-gray-600">Loading statistics...</p>
        </div>
      )}
    </div>
  );

  const renderLogs = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Tasks</h2>
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">{log.task}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {log.response}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span>{log.processingTime}ms</span>
                    <span className={`px-2 py-1 rounded-full ${
                      log.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tasks yet. Start a conversation!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to AI Assistant
              </h2>
              <p className="text-gray-600 mb-6">
                Describe your task and I'll help you analyze, summarize, or process it.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Try these examples:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['analyze leads', 'summarize calls', 'update client report'].map((task) => (
                    <button
                      key={task}
                      onClick={() => handleSendMessage({ task, priority: 'medium' })}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.isUser}
              isTyping={message.isTyping}
              onTypingComplete={() => handleTypingComplete(message.id)}
            />
          ))
        )}

        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <TaskInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!isConnected}
      />
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${
        showSidebar 
          ? 'translate-x-0 opacity-100' 
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}>
        <Sidebar
          onClearChat={handleClearChat}
          onViewStats={handleViewStats}
          onViewLogs={handleViewLogs}
          onViewChat={handleViewChat}
          onShowClearModal={() => setShowClearModal(true)}
          isConnected={isConnected}
          stats={stats}
          currentView={currentView}
        />
      </div>

      {/* Backdrop for mobile */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        showSidebar ? 'ml-0' : 'ml-0'
      }`}>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-3 hover:bg-primary-50 rounded-xl transition-all duration-200 group"
              >
                <Menu className={`w-6 h-6 text-primary-600 group-hover:text-primary-700 transition-transform duration-200 ${
                  showSidebar ? 'rotate-90' : 'rotate-0'
                }`} />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {currentView === 'chat' && 'AI Assistant'}
                {currentView === 'stats' && 'Statistics Dashboard'}
                {currentView === 'logs' && 'Task History'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-success-500' : 'bg-red-500'
              } animate-pulse`} />
              <span className="text-sm font-medium text-gray-700">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'chat' && renderChat()}
          {currentView === 'stats' && renderStats()}
          {currentView === 'logs' && renderLogs()}
        </div>
      </div>

      {/* Clear All Logs Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Clear All Logs</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete all interaction logs? This will permanently remove:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-6">
                <li>• All task history</li>
                <li>• All AI responses</li>
                <li>• All processing statistics</li>
                <li>• All interaction metadata</li>
              </ul>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllLogs}
                disabled={isClearing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Logs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
