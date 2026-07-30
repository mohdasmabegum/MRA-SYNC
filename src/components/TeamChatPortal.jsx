import React, { useState, useEffect, useRef } from 'react';
import { getChatMessages, sendChatMessage } from '../services/db';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Send, ShieldCheck, User, ArrowLeft } from 'lucide-react';

export const TeamChatPortal = ({ activeUser, onBackToDashboard }) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const isExecutiveOrPM =
    activeUser?.role === 'CEO/FOUNDER/DIRECTOR' ||
    activeUser?.role === 'PROJECT_COORDINATOR' ||
    activeUser?.dept === 'Project Management';

  useEffect(() => {
    loadMessages();
    window.addEventListener('mra_db_updated', loadMessages);
    return () => window.removeEventListener('mra_db_updated', loadMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    setMessages(getChatMessages());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendChatMessage({
      senderId: activeUser?.id,
      senderName: activeUser?.name,
      senderRole: activeUser?.role,
      avatar: activeUser?.avatar,
      text: inputMessage.trim()
    });

    setInputMessage('');
  };

  if (!isExecutiveOrPM) {
    return (
      <div className="portal-page-container">
        <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <div className="alert-card alert-warning text-center p-8">
          <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">ACCESS RESTRICTED: PROJECT MANAGEMENT & EXECUTIVES ONLY</h3>
          <p className="text-xs text-slate-400">Team Chat is exclusively enabled for CEO, Founder, Directors, Project Coordinators, and Project Management team members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page-container">
      {/* Top Left Symbol Back Button */}
      <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {/* Header Bar */}
      <div className="portal-header-bar glow-card border-amber-500/40">
        <div>
          <h2 className="portal-title flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            Project Management Team Chat
          </h2>
          <p className="portal-subtitle">Real-time collaboration channel for CEO, Project Coordinators & PM team members.</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="glow-card p-4 flex flex-col h-[520px]">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
          {messages.map(msg => {
            const isMe = msg.senderId === activeUser?.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <img src={msg.avatar} alt={msg.senderName} className="w-8 h-8 rounded-full border border-amber-400/50 mt-1" />
                <div className={`max-w-md rounded-xl p-3 text-xs ${
                  isMe
                    ? 'bg-amber-500/20 border border-amber-500/40 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-bold text-amber-400 text-[11px]">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-800 pt-3">
          <input
            type="text"
            placeholder="Type your message to Project Management team..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            className="flex-1"
          />
          <button type="submit" className="btn-gold">
            <Send className="w-4 h-4 mr-1" /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
