import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Volume2, VolumeX, Minimize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChatHistory, useSendMessage } from '../../hooks/useChatbot';
import { playBeep } from '../../utils/alertSound';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [alertMonitorExpanded, setAlertMonitorExpanded] = useState(false);
  
  const chatButtonBottom = alertMonitorExpanded ? '220px' : '80px';
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { isAuthenticated, user } = useAuth();
  const { messages: firestoreMessages, isLoading: loadingHistory } = useChatHistory(isAuthenticated);
  const sendMessageMutation = useSendMessage();
  
  const messages = localMessages;

  useEffect(() => {
    const handleAlertMonitorToggle = (event) => {
      setAlertMonitorExpanded(event.detail.isExpanded);
    };

    window.addEventListener('alertMonitorToggle', handleAlertMonitorToggle);
    
    return () => {
      window.removeEventListener('alertMonitorToggle', handleAlertMonitorToggle);
    };
  }, []);

  const quickPrompts = [
    "Show latest KPIs",
    "Explain last anomaly",
    "Simulate 30% alt fuel"
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const checkForCriticalAlerts = () => {
      const hasCriticalAlert = false;
      if (hasCriticalAlert && isSoundEnabled) {
        playBeep('critical');
      }
    };

    const interval = setInterval(checkForCriticalAlerts, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isSoundEnabled]);

  const handleToggleChat = () => {
    if (!isAuthenticated && !isOpen) {
      setShowLoginPrompt(true);
      return;
    }
    setIsOpen(!isOpen);
    setShowLoginPrompt(false);
  };

  const handleSendMessage = async (text = message) => {
    if (!text.trim() || sendMessageMutation.isPending) return;
    
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const userMessage = text.trim();
    setMessage('');

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      read: true
    };
    setLocalMessages(prev => [...prev, userMsg]);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: userMessage,
        userId: user?.uid || user?.email,
        userName: user?.name || user?.email
      });
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || response.message || 'No response',
        timestamp: new Date().toISOString(),
        read: false
      };
      setLocalMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
    }
  };

  const handleQuickPrompt = (prompt) => {
    setMessage(prompt);
    handleSendMessage(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div 
        className="fixed right-6 z-[9999] transition-all duration-300"
        style={{ bottom: chatButtonBottom }}
      >
        {!isOpen && (
          <button
            onClick={handleToggleChat}
            className="group relative bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50"
            aria-label="Open chatbot"
          >
            <MessageCircle size={28} className="animate-pulse" />
            
            {messages.some(m => !m.read && m.role === 'assistant') && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                !
              </span>
            )}

            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Ask XementAI Assistant
            </span>
          </button>
        )}

        {isOpen && (
          <div className="bg-surface border-2 border-border-light rounded-2xl shadow-2xl w-[360px] h-[500px] flex flex-col overflow-hidden animate-scale-in">
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">XementAI Assistant</h3>
                  <p className="text-xs text-white/80">Powered by Gemini AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                  aria-label={isSoundEnabled ? 'Mute alerts' : 'Unmute alerts'}
                >
                  {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                
                <button
                  onClick={handleToggleChat}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {showLoginPrompt && !isAuthenticated && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  Please sign in to use the chatbot
                </p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <MessageCircle size={48} className="text-text-secondary mb-4" />
                  <h4 className="font-semibold text-text-primary mb-2">
                    Welcome to XementAI Assistant!
                  </h4>
                  <p className="text-sm text-text-secondary mb-4">
                    Ask me about KPIs, anomalies, simulations, or recommendations.
                  </p>
                  
                  <div className="space-y-2 w-full">
                    <p className="text-xs text-text-secondary font-medium mb-2">Try these:</p>
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="w-full text-left text-sm bg-surface hover:bg-primary/10 border border-border-light rounded-lg px-3 py-2 transition-colors text-text-primary"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-surface border border-border-light text-text-primary'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.role === 'user' ? 'text-white/70' : 'text-text-secondary'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-surface border border-border-light rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="animate-spin text-primary" size={16} />
                        <span className="text-sm text-text-secondary">Thinking...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-4 border-t border-border-light bg-surface">
              {messages.length > 0 && !sendMessageMutation.isPending && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-xs bg-background hover:bg-primary/10 border border-border-light rounded-full px-3 py-1 transition-colors text-text-primary whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isAuthenticated ? "Ask me anything..." : "Sign in to chat"}
                  disabled={!isAuthenticated || sendMessageMutation.isPending}
                  className="flex-1 bg-background border border-border-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || !isAuthenticated || sendMessageMutation.isPending}
                  className="bg-primary hover:bg-primary-dark text-white rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Send message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              
              {sendMessageMutation.isError && (
                <p className="text-xs text-red-500 mt-2">
                  Failed to send message. Please try again.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default FloatingChatbot;
