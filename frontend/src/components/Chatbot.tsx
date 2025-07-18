import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { sendChatMessage, getChatSuggestions } from '../services/api';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

interface ChatSuggestion {
  text: string;
  type: string;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "👋 Bonjour ! Je suis votre assistant pharmacie. Je peux vous aider avec les promotions, la disponibilité des produits, les emplacements des magasins, et plus encore. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date(),
      suggestions: ["Promotions actuelles", "Emplacements des magasins", "Recherche de produits", "Informations de contact"]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load initial suggestions
    const loadSuggestions = async () => {
      try {
        const response = await getChatSuggestions();
        if (response.success && response.suggestions) {
          setSuggestions(response.suggestions);
        }
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    };

    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(message);
      
      if (response.success && response.response) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          isUser: false,
          timestamp: new Date(),
          suggestions: response.suggestions || [],
          data: response.data
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, j'ai des difficultés à répondre en ce moment. Veuillez réessayer plus tard ou contacter notre équipe de support.",
        isUser: false,
        timestamp: new Date(),
        suggestions: ["Contacter le support", "Réessayer", "Emplacements des magasins"]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const formatMessageText = (text: string) => {
    // Convert newlines to line breaks and preserve formatting
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50 p-0"
                  aria-label="Ouvrir le chat"
      >
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 bg-white rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg flex-shrink-0">
        <h3 className="text-lg font-semibold">💬 Assistant Pharmacie</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 text-white hover:bg-blue-700"
          aria-label="Fermer le chat"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div
                className={`max-w-[85%] min-w-0 rounded-lg px-3 py-2 break-words ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {formatMessageText(message.text)}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
                
                {/* Suggestions */}
                {!message.isUser && message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.suggestions.slice(0, 4).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-700 border-gray-300 flex-shrink-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[85%]">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {suggestions.length > 0 && messages.length === 1 && (
          <div className="px-4 py-2 border-t border-gray-200 flex-shrink-0">
            <div className="text-xs text-gray-500 mb-2">Suggestions rapides :</div>
            <div className="flex flex-wrap gap-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300 flex-shrink-0"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              disabled={isLoading}
              className="flex-1 min-w-0"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 flex-shrink-0"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 