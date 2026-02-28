import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Loader2, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../../api/ai';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI Health Assistant. How can I help you today? Remember, this is for general information only. Always consult a licensed doctor for medical advice.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await sendChatMessage(
        input,
        null, // No streaming for simple widget for now
        (response) => {
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          setLoading(false);
        },
        (error) => {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
          setLoading(false);
          console.error('Chat error:', error);
        }
      );
    } catch (err) {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary-500 to-medical-500 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-50 group"
      >
        <Bot className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 ${isMinimized ? 'w-72 h-14' : 'w-96 h-[550px]'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600 to-medical-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {!isMinimized && (
            <div>
              <h3 className="text-white font-semibold text-sm">AI Health Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <p className="text-[10px] text-white/80">Active Now</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Disclaimer */}
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <p className="text-[10px] text-amber-800 font-medium tracking-tight">
              AI provides general info. Always consult a licensed doctor.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary-500' : 'bg-medical-500'
                    }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
                    }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2.5 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-medical-500 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-gray-100 rounded-tl-sm shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3">
              Powered by ClinicFlow AI Core
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatWidget;
