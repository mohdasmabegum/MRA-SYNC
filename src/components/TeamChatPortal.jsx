import React, { useState, useEffect, useRef } from 'react';
import {
  getConversations,
  getMessagesForConversation,
  sendChatMessageToConv,
  getUsers,
  getOrCreateDirectConversation,
  createGroupConversation
} from '../services/db';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  User,
  ArrowLeft,
  Users,
  PlusCircle,
  Search,
  CheckCircle,
  MessageCircle,
  Plus
} from 'lucide-react';

export const TeamChatPortal = ({ activeUser, onBackToDashboard }) => {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

  const messagesEndRef = useRef(null);

  const isExecutiveOrPM =
    activeUser?.role === 'CEO/FOUNDER/DIRECTOR' ||
    activeUser?.role === 'PROJECT_COORDINATOR' ||
    activeUser?.dept === 'Project Management';

  useEffect(() => {
    loadData();
    window.addEventListener('mra_db_updated', loadData);
    return () => window.removeEventListener('mra_db_updated', loadData);
  }, [activeUser]);

  useEffect(() => {
    if (activeConv) {
      setMessages(getMessagesForConversation(activeConv.id));
    }
  }, [activeConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = () => {
    const convs = getConversations();
    const users = getUsers();
    setConversations(convs);
    setUsersList(users);

    if (!activeConv && convs.length > 0) {
      setActiveConv(convs[0]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectUserDirect = (targetUser) => {
    const directConv = getOrCreateDirectConversation(activeUser, targetUser);
    setActiveConv(directConv);
    showToast(`Opened 1-on-1 chat with ${targetUser.name}`, 'info');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    sendChatMessageToConv(activeConv.id, {
      senderId: activeUser?.id,
      senderName: activeUser?.name,
      senderRole: activeUser?.role,
      avatar: activeUser?.avatar,
      text: inputMessage.trim()
    });

    setInputMessage('');
  };

  const handleCreateGroupSubmit = (e) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) {
      showToast('Please enter a group title.', 'error');
      return;
    }

    const members = [activeUser.id, ...selectedGroupMembers];
    const newGroup = createGroupConversation(newGroupTitle.trim(), members);
    showToast(`Group "${newGroupTitle}" created!`, 'success');
    setShowCreateGroupModal(false);
    setNewGroupTitle('');
    setSelectedGroupMembers([]);
    setActiveConv(newGroup);
  };

  const toggleGroupMember = (userId) => {
    if (selectedGroupMembers.includes(userId)) {
      setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== userId));
    } else {
      setSelectedGroupMembers([...selectedGroupMembers, userId]);
    }
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

  const otherTeamMembers = usersList.filter(u => u.id !== activeUser?.id);

  return (
    <div className="portal-page-container">
      {/* Top Left Symbol Back Button */}
      <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {/* Main 2-Column Chat Dashboard Layout */}
      <div className="glow-card grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[620px]">
        {/* Left Column: Direct Messages & Group Conversations Sidebar */}
        <div className="md:col-span-4 border-r border-slate-800 p-4 flex flex-col justify-between bg-slate-950/40">
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Header & Create Group Action */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-400" /> PM Conversations
              </h3>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="btn-gold btn-xs font-bold"
                title="Create Group Conversation"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Group
              </button>
            </div>

            {/* Active Group Conversations */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Group Channels</div>
              <div className="space-y-1">
                {conversations.filter(c => c.type === 'group').map(c => {
                  const isActive = activeConv?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveConv(c)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isActive
                          ? 'bg-sky-500/20 border border-sky-500/40 text-white font-bold'
                          : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{c.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{c.lastMessage}</div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{c.lastTimestamp}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 1-on-1 Direct Messaging Roster */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">1-on-1 Direct Messages</div>
              <div className="space-y-1">
                {otherTeamMembers.map(u => {
                  const isSelected = activeConv?.type === 'direct' && activeConv?.targetUserId === u.id;

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUserDirect(u)}
                      className={`p-2 rounded-lg cursor-pointer transition-all flex items-center gap-2.5 text-xs ${
                        isSelected
                          ? 'bg-sky-500/20 border border-sky-500/40 text-white font-bold'
                          : 'bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="relative">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-sky-400/50 object-cover" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full"></span>
                      </div>

                      <div className="truncate flex-1">
                        <div className="font-semibold text-white text-xs">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.role} • {u.dept}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Conversation Feed & Message Bar */}
        <div className="md:col-span-8 flex flex-col justify-between h-full bg-slate-950/20">
          {/* Header Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeConv?.type === 'direct' ? (
                <img
                  src={activeConv?.targetUserAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Direct'}
                  alt="Target Avatar"
                  className="w-10 h-10 rounded-full border-2 border-sky-400 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center">
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
              )}

              <div>
                <h3 className="font-bold text-white text-sm">{activeConv?.title || 'Select a Conversation'}</h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span>🟢 Online • Active Conversation Channel</span>
                </p>
              </div>
            </div>
          </div>

          {/* Messages Stream Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs italic">
                No messages recorded in this conversation yet. Send a direct message below!
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

          {/* Pinned Bottom Input Form */}
          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <input
              type="text"
              placeholder={`Send message in ${activeConv?.title || 'chat'}...`}
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

      {/* CREATE NEW GROUP MODAL DIALOG */}
      {showCreateGroupModal && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card max-w-md">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Create Group Conversation</h3>
              </div>
              <button onClick={() => setShowCreateGroupModal(false)} className="icon-btn-ghost">✕</button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="modal-body space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Group Conversation Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Project Apollo Leads Sync"
                  value={newGroupTitle}
                  onChange={e => setNewGroupTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-2 font-bold">Select Group Members (Check to Add):</label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 bg-slate-900/60 p-2 rounded border border-slate-800">
                  {otherTeamMembers.map(u => {
                    const isChecked = selectedGroupMembers.includes(u.id);

                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleGroupMember(u.id)}
                        className={`p-2 rounded cursor-pointer flex items-center justify-between transition-all ${
                          isChecked ? 'bg-sky-500/20 border border-sky-500/40 text-white' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <div className="font-bold">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.role} ({u.dept})</div>
                          </div>
                        </div>
                        {isChecked && <CheckCircle className="w-4 h-4 text-sky-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer pt-2">
                <button type="button" onClick={() => setShowCreateGroupModal(false)} className="btn-secondary btn-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-gold btn-xs font-bold">
                  Create Group Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
