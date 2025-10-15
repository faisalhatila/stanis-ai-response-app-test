import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  BarChart3, 
  Trash2, 
  Bot,
  Activity,
  Clock,
  Database,
  Zap,
  TrendingUp,
  Plus
} from 'lucide-react';
import { healthAPI } from '../services/api';

const Sidebar = ({ 
  onClearChat, 
  onViewStats, 
  onViewLogs, 
  onViewChat,
  onShowClearModal,
  isConnected,
  stats,
  currentView
}) => {
  const [isExpanded] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthAPI.checkHealth();
        setHealthStatus(response.data);
      } catch (error) {
        setHealthStatus({ status: 'unhealthy' });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleClearAllLogs = () => {
    onShowClearModal();
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 h-full w-80 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-primary-600" />
            </div>
            {isExpanded && (
              <div>
                <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-success-400' : 'bg-red-400'
                  } animate-pulse`} />
                  <span className="text-sm text-primary-100 font-medium">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-3">
        <button
          onClick={onViewChat}
          className={`w-full flex items-center space-x-3 p-4 text-left rounded-xl transition-all duration-200 group ${
            currentView === 'chat' 
              ? 'bg-gradient-to-r from-primary-100 to-primary-200 border-2 border-primary-300' 
              : 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
            currentView === 'chat' 
              ? 'bg-primary-500' 
              : 'bg-primary-100 group-hover:bg-primary-200'
          }`}>
            <Plus className={`w-6 h-6 ${
              currentView === 'chat' ? 'text-white' : 'text-primary-600'
            }`} />
          </div>
          {isExpanded && (
            <span className={`font-medium ${
              currentView === 'chat' ? 'text-primary-800' : 'text-gray-700'
            }`}>
              New Task
            </span>
          )}
        </button>

        <button
          onClick={onViewLogs}
          className={`w-full flex items-center space-x-3 p-4 text-left rounded-xl transition-all duration-200 group ${
            currentView === 'logs' 
              ? 'bg-gradient-to-r from-primary-100 to-primary-200 border-2 border-primary-300' 
              : 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
            currentView === 'logs' 
              ? 'bg-primary-500' 
              : 'bg-primary-100 group-hover:bg-primary-200'
          }`}>
            <MessageSquare className={`w-6 h-6 ${
              currentView === 'logs' ? 'text-white' : 'text-primary-600'
            }`} />
          </div>
          {isExpanded && (
            <span className={`font-medium ${
              currentView === 'logs' ? 'text-primary-800' : 'text-gray-700'
            }`}>
              Recent Tasks
            </span>
          )}
        </button>

        <button
          onClick={onViewStats}
          className={`w-full flex items-center space-x-3 p-4 text-left rounded-xl transition-all duration-200 group ${
            currentView === 'stats' 
              ? 'bg-gradient-to-r from-accent-100 to-accent-200 border-2 border-accent-300' 
              : 'hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
            currentView === 'stats' 
              ? 'bg-accent-500' 
              : 'bg-accent-100 group-hover:bg-accent-200'
          }`}>
            <BarChart3 className={`w-6 h-6 ${
              currentView === 'stats' ? 'text-white' : 'text-accent-600'
            }`} />
          </div>
          {isExpanded && (
            <span className={`font-medium ${
              currentView === 'stats' ? 'text-accent-800' : 'text-gray-700'
            }`}>
              Statistics
            </span>
          )}
        </button>

        <button
          onClick={handleClearAllLogs}
          className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-200 group"
        >
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          {isExpanded && <span className="text-red-600 font-medium">Clear All Logs</span>}
        </button>
      </nav>

      {/* Stats */}
      {isExpanded && stats && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
            Statistics
          </h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-700">Total Tasks</p>
                    <p className="text-2xl font-bold text-primary-800">{stats.totalInteractions}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-success-50 to-success-100 rounded-xl p-4 border border-success-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-success-700">Success Rate</p>
                    <p className="text-2xl font-bold text-success-800">{stats.successRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-warning-50 to-warning-100 rounded-xl p-4 border border-warning-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warning-700">Avg. Time</p>
                    <p className="text-2xl font-bold text-warning-800">{stats.averageProcessingTime.toFixed(0)}ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Status */}
      {isExpanded && healthStatus && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Database className="w-5 h-5 text-primary-600 mr-2" />
            System Status
          </h3>
          
          <div className="space-y-3">
            <div className={`rounded-xl p-4 border-2 ${
              healthStatus.status === 'healthy' 
                ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200' 
                : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  healthStatus.status === 'healthy' ? 'bg-success-500' : 'bg-red-500'
                } animate-pulse`} />
                <div>
                  <p className="font-medium text-gray-800">
                    {healthStatus.status === 'healthy' ? 'System Healthy' : 'System Issues'}
                  </p>
                  <p className="text-sm text-gray-600">Overall Status</p>
                </div>
              </div>
            </div>
            
            {healthStatus.database && (
              <div className={`rounded-xl p-4 border-2 ${
                healthStatus.database === 'connected' 
                  ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200' 
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    healthStatus.database === 'connected' ? 'bg-primary-500' : 'bg-red-500'
                  } animate-pulse`} />
                  <div>
                    <p className="font-medium text-gray-800">
                      Database {healthStatus.database}
                    </p>
                    <p className="text-sm text-gray-600">Storage Status</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
