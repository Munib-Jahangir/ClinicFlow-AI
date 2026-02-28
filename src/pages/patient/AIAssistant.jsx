import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Brain, History, Trash2 } from 'lucide-react';
import { sendChatMessage } from '../../api/ai';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Asalam-o-Alaikum! I\'m your personalized ClinicFlow AI Assistant. I can help you understand your health records, medications, or any medical concerns. How can I help you today?' }
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

    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            await sendChatMessage(
                currentInput,
                null,
                (response) => {
                    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    setLoading(false);
                },
                (error) => {
                    setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
                    setLoading(false);
                }
            );
        } catch (err) {
            setLoading(false);
        }
    };

    const clearChat = () => {
        if (window.confirm('Are you sure you want to clear the conversation?')) {
            setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you now?' }]);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary-500 to-medical-500 rounded-2xl shadow-lg">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Health Companion</h1>
                        <p className="text-gray-500">Intelligent support for your healthcare journey</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={clearChat}>
                        <Trash2 className="w-4 h-4 mr-2" /> Clear Chat
                    </Button>
                    <Badge variant="medical" className="px-3 py-1">
                        <Sparkles className="w-4 h-4 mr-1" /> Premium AI
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Quick Topics" className="!p-4">
                        <div className="space-y-2">
                            {[
                                'Explain my diagnosis',
                                'Medication side effects',
                                'Healthy diet tips',
                                'Symptom checker',
                                'Find a specialist'
                            ].map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => setInput(topic)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card title="AI Capabilities" className="!p-4 bg-primary-50/50 border-primary-100">
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <Brain className="w-5 h-5 text-primary-600 shrink-0" />
                                <div className="text-xs text-gray-600 leading-relaxed">
                                    <span className="font-bold text-gray-800 block mb-1">Medical Knowledge</span>
                                    Access to generalized healthcare databases.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <History className="w-5 h-5 text-medical-600 shrink-0" />
                                <div className="text-xs text-gray-600 leading-relaxed">
                                    <span className="font-bold text-gray-800 block mb-1">Context Aware</span>
                                    Remembers your current session details.
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Chat Interface */}
                <div className="lg:col-span-3 flex flex-col h-[650px]">
                    <Card className="flex-1 flex flex-col !p-0 overflow-hidden relative border-none shadow-xl ring-1 ring-gray-100">
                        {/* Disclaimer Overlay */}
                        <div className="absolute top-0 left-0 right-0 bg-amber-50/90 backdrop-blur-sm border-b border-amber-200 px-4 py-2 z-10 flex items-center justify-center gap-2">
                            <AlertSquare className="w-4 h-4 text-amber-600" />
                            <p className="text-[10px] text-amber-800 font-medium text-center uppercase tracking-wider">
                                This AI is for informational purposes only. Consult a doctor for medical emergencies.
                            </p>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-6 pt-14 space-y-6 bg-gray-50/30">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user' ? 'bg-primary-600' : 'bg-medical-600'
                                            }`}>
                                            {msg.role === 'user' ? (
                                                <User className="w-5 h-5 text-white" />
                                            ) : (
                                                <Bot className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <div className={`p-4 rounded-3xl text-sm shadow-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-primary-600 text-white rounded-tr-sm'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                                }`}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2 px-1">
                                                {msg.role === 'user' ? 'You' : 'ClinicFlow AI'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-4 max-w-[85%]">
                                        <div className="w-10 h-10 rounded-2xl bg-medical-500 flex items-center justify-center shadow-md">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="p-4 rounded-3xl bg-white border border-gray-100 rounded-tl-sm shadow-sm flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 text-medical-500 animate-spin" />
                                            <span className="text-sm text-gray-400">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            <form onSubmit={sendMessage} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Describe your health concern or ask a question..."
                                    className="w-full pl-6 pr-16 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none text-gray-700 transition-all placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="absolute right-2 top-2 bottom-2 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center active:scale-95 shadow-lg shadow-primary-200"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Simple Alert Component integrated
const AlertSquare = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

export default AIAssistant;
