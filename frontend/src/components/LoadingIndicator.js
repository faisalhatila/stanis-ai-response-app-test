import React, { useState, useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';

const LoadingIndicator = ({ message = "AI is thinking..." }) => {
  const loadingMessages = [
    "Analyzing your request...",
    "Processing the task...",
    "Generating response...",
    "Almost ready...",
    "Finalizing results..."
  ];

  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start space-x-3 p-4">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
            <span className="text-sm text-gray-600 font-medium">
              {currentMessage}
            </span>
          </div>
          <div className="mt-3 flex space-x-1">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
