import React from 'react';
import { User, Bot, Clock, CheckCircle, XCircle } from 'lucide-react';
import TypingAnimation from './TypingAnimation';

const MessageBubble = ({ message, isUser, isTyping = false, onTypingComplete }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-600' : 'bg-primary-100'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-primary-600" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div className={`message-bubble ${
          isUser ? 'user-message' : 'ai-message'
        }`}>
          {/* Message Header */}
          <div className={`flex items-center space-x-2 mb-2 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <span className="text-xs font-medium text-gray-500">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            {message?.timestamp && (
              <span className="text-xs text-gray-400">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
            {message?.status && getStatusIcon(message.status)}
          </div>

          {/* Message Text */}
          <div className={`text-sm leading-relaxed ${
            isUser ? 'text-white' : 'text-gray-800'
          }`}>
            {isTyping ? (
              <TypingAnimation 
                text={message.response || message.text} 
                speed={20}
                onComplete={onTypingComplete}
              />
            ) : (
              <div className="whitespace-pre-wrap">
                {message.response || message.text}
              </div>
            )}
          </div>

          {/* Processing Time */}
          {message?.processingTime && (
            <div className={`mt-2 text-xs ${
              isUser ? 'text-primary-200' : 'text-gray-500'
            }`}>
              Processed in {message.processingTime}ms
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
