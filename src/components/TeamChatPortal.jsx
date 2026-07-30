import React, { useState, useEffect, useRef } from 'react';
import { getChatMessages, sendChatMessage } from '../services/db';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Send, ShieldCheck, User, ArrowLeft, Users, Paperclip } from 'lucide-react';

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

      {/* Main Chat Container Card */}
      <div className="chat-container">
        {/* Fixed Top Chat Header Bar */}
        <div className="chat-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30">
              <MessageSquare className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Project Management Team Channel</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Executive & PM Collaboration • Real-time Stream</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-tag bg-sky-500/20 text-sky-300 font-bold">
              <Users className="w-3 h-3 inline mr-1" /> PM Channel
            </span>
          </div>
        </div>

        {/* Scrollable Chat Feed */}
        <div className="chat-feed">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              No chat messages yet. Start the conversation with the Project Management team below!
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === activeUser?.id;

              return (
                <div key={msg.id} className={`chat-row ${isMe ? 'chat-row-me' : 'chat-row-other'}`}>
                  <img src={msg.avatar} alt={msg.senderName} className="chat-avatar-img" />

                  <div className={`chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'}`}>
                    <div className="chat-sender-name">{msg.senderName}</div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className="chat-time-tag">{msg.timestamp}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pinned Bottom Input Form Bar */}
        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input
            type="text"
            placeholder="Write a message to Project Management team..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            className="flex-1"
          />
          <button type="submit" className="btn-gold font-bold">
            <Send className="w-4 h-4 mr-1" /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
