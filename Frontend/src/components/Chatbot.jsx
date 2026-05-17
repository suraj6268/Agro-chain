import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Chatbot.css';
const API_BASE = 'http://localhost:3000';

const Chatbot = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hi there! I am AgroBot. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        
        const newMessages = [...messages, { role: 'user', text: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Format history for Gemini API
            const history = messages
                // Skip the initial greeting as Gemini expects history to start with 'user'
                .filter((msg, index) => !(index === 0 && msg.role === 'model'))
                .map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                }));

            const response = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: history
                })
            });
            const data = await response.json();

            if (data.success) {
                setMessages([...newMessages, { role: 'model', text: data.reply }]);
            } else {
                setMessages([...newMessages, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages([...newMessages, { role: 'model', text: 'Sorry, I am unable to connect to the server right now.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-title">
                            <span className="chatbot-icon">🤖</span>
                            AgroBot
                        </div>
                        <button className="chatbot-close-btn" onClick={toggleChat}>&times;</button>
                    </div>
                    
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.role}`}>
                                <div className={`message-bubble ${msg.role}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper model">
                                <div className="message-bubble model loading">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="send-icon">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <div className="chatbot-toggle-wrapper">
                {!isOpen && <div className="chatbot-tooltip">Ask me!</div>}
                <button className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
                    {isOpen ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
