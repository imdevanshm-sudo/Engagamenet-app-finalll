import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';

const ChatView = ({ userName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedMessages = localStorage.getItem('wedding_chat_messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: userName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('wedding_chat_messages', JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  return (
    <div className="absolute inset-0 z-50 bg-stone-100 flex flex-col">
      <div className="flex-shrink-0 bg-white shadow-md p-4 flex items-center justify-between z-10">
        <h2 className="font-heading text-xl text-[#4a0e11]">Guest Chat</h2>
        <button onClick={onClose} className="p-2 text-stone-500 hover:text-[#4a0e11]">
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === userName ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 bg-stone-300 flex items-center justify-center`}>
                <User size={16} className="text-stone-600" />
              </div>
              <div className={`p-3 rounded-lg max-w-xs ${msg.sender === userName ? 'bg-rose-100' : 'bg-white'}`}>
                <p className="text-sm text-stone-800">{msg.text}</p>
                <div className="text-xs text-stone-400 mt-1 text-right">
                  {msg.sender}, {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 p-4 bg-white border-t border-stone-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your wishes..."
            className="flex-grow px-4 py-2 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button type="submit" className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
