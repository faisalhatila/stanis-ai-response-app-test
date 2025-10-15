import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const TaskInput = ({ onSendMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;

    const taskData = {
      task: message.trim(),
      priority: 'medium'
    };

    onSendMessage(taskData);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const exampleTasks = [
    "analyze leads",
    "summarize calls", 
    "update client report",
    "create marketing strategy"
  ];

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input */}
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your task... (e.g., 'analyze leads', 'summarize calls')"
            className="input-field min-h-[60px] pr-12"
            disabled={isLoading || disabled}
            rows={2}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className="absolute right-3 bottom-3 p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>


        {/* Example Tasks */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Quick Examples:
          </label>
          <div className="flex flex-wrap gap-2">
            {exampleTasks.map((task, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMessage(task)}
                disabled={isLoading || disabled}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {task}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;
