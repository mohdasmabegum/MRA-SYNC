// Local Database Storage Service for MRA SYNC Portal

const STORAGE_KEYS = {
  USERS: 'mra_db_users',
  LEAVES: 'mra_db_leave_applications',
  MATERIALS: 'mra_db_material_requests',
  WORK_LOGS: 'mra_db_work_transfer_logs',
  MEETINGS: 'mra_db_meeting_logs',
  CHAT_MESSAGES: 'mra_db_chat_messages',
  SESSION: 'mra_db_active_session'
};

// Initial Seed Users
export const DEFAULT_USERS = [
  {
    id: 'CEO001',
    name: 'Alexander Vance',
    email: 'ceo@mrasync.com',
    password: 'admin',
    role: 'CEO/FOUNDER/DIRECTOR',
    dept: 'Executive Management',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'PC001',
    name: 'Sarah Connor',
    email: 'pc@mrasync.com',
    password: 'admin',
    role: 'PROJECT_COORDINATOR',
    dept: 'Project Management',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'TL001',
    name: 'Michael Scott',
    email: 'tl@mrasync.com',
    password: 'admin',
    role: 'TL',
    dept: 'Hardware & Embedded Systems',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'STL001',
    name: 'Jim Halpert',
    email: 'subtl@mrasync.com',
    password: 'admin',
    role: 'SUB_TL',
    dept: 'Hardware & Embedded Systems',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'HR001',
    name: 'Pam Beesly',
    email: 'hr@mrasync.com',
    password: 'admin',
    role: 'HR',
    dept: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'EMP101',
    name: 'John Doe',
    email: 'john@mrasync.com',
    password: 'user',
    role: 'EMPLOYEE',
    dept: 'Hardware & Embedded Systems',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'EMP102',
    name: 'Jane Smith',
    email: 'jane@mrasync.com',
    password: 'user',
    role: 'EMPLOYEE',
    dept: 'Software & AI Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'EMP103',
    name: 'Robert Drake',
    email: 'robert@mrasync.com',
    password: 'user',
    role: 'EMPLOYEE',
    dept: 'Inventory & Logistics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

// Initial Seed Leaves
const DEFAULT_LEAVES = [
  {
    id: 'LV-2026-001',
    empId: 'EMP101',
    name: 'John Doe',
    dept: 'Hardware & Embedded Systems',
    fromTo: '2026-08-01 to 2026-08-03',
    contact: '+1 555-0192',
    noOfDays: 3,
    purpose: 'Family Medical Emergency',
    leaveType: 'EL',
    requirementType: 'Emergency',
    approvedBy: 'Pam Beesly (HR)',
    appliedDate: '2026-07-28 09:30 AM',
    acceptedDate: '2026-07-28 02:15 PM',
    status: 'Approved'
  },
  {
    id: 'LV-2026-002',
    empId: 'EMP102',
    name: 'Jane Smith',
    dept: 'Software & AI Systems',
    fromTo: '2026-08-05 to 2026-08-06',
    contact: '+1 555-0144',
    noOfDays: 2,
    purpose: 'Personal relocation work',
    leaveType: 'CL',
    requirementType: 'General',
    approvedBy: 'Pending Review',
    appliedDate: '2026-07-29 11:00 AM',
    acceptedDate: '—',
    status: 'Pending'
  }
];

// Initial Seed Material Requests
const DEFAULT_MATERIALS = [
  {
    id: 'MAT-801',
    empName: 'Michael Scott (TL)',
    empId: 'TL001',
    targetTLId: 'TL001',
    targetTLName: 'Michael Scott',
    deptName: 'Hardware & Embedded Systems',
    materialType: 'STM32 Microcontroller Dev Boards & JTAG Debuggers',
    noOfUnits: '5 Units',
    requirementType: 'Emergency',
    forProject: 'Project Apollo Satellite Node',
    availableAtMoment: 'No',
    status: 'Order Placed',
    inventoryHandledBy: 'Robert Drake (Inventory)',
    requestDate: '2026-07-25 10:00 AM',
    reachedDate: '2026-07-25 10:05 AM',
    acceptedDate: '2026-07-25 11:30 AM',
    providedDate: 'Pending Delivery',
    orderPlacedDate: '2026-07-26 09:00 AM',
    orderReceivedDate: 'Expected 2026-08-02',
    noOfDaysToReceiveOrder: '7 Days',
    noOfDaysForProvidingMaterial: '8 Days (Est.)',
    updates: 'Item out of stock in warehouse. Order PO-9942 placed with vendor.'
  }
];

// Initial Seed Work Transfer Logs
const DEFAULT_WORK_LOGS = [
  {
    id: 'WRK-1001',
    workAlloter: 'Michael Scott',
    senderEmpId: 'TL001',
    fromDept: 'Hardware & Embedded Systems',
    toDept: 'Software & AI Systems',
    receiverEmpId: 'EMP102',
    receiverName: 'Jane Smith',
    projectName: 'Project Apollo Satellite Node',
    hardwareDocInfo: 'Hardware PCB v2.4 delivered with Schematics Rev-B & pinout documentation PDF.',
    requirement: 'Emergency',
    hardwareDocReceived: true,
    createdDate: '2026-07-28 09:00 AM',
    acceptedDate: '2026-07-28 09:30 AM',
    completedDate: '2026-07-29 04:00 PM',
    status: 'Completed ✅',
    rejectionReason: ''
  },
  {
    id: 'WRK-1002',
    workAlloter: 'Sarah Connor (Project Coordinator)',
    senderEmpId: 'PC001',
    fromDept: 'Project Management',
    toDept: 'Hardware & Embedded Systems',
    receiverEmpId: 'EMP101',
    receiverName: 'John Doe',
    projectName: 'Telemetry Gateway Module',
    hardwareDocInfo: 'Spec sheet & prototype chassis enclosed.',
    requirement: 'Quick',
    hardwareDocReceived: true,
    createdDate: '2026-07-29 10:15 AM',
    acceptedDate: '2026-07-29 10:45 AM',
    completedDate: 'Pending',
    status: 'Accepted / In Progress',
    rejectionReason: ''
  }
];

// Initial Seed Meeting Logs
const DEFAULT_MEETINGS = [
  {
    id: 'MTG-301',
    title: 'Sprint Planning & Material Requisition Sync',
    organizer: 'Alexander Vance (CEO)',
    organizerId: 'CEO001',
    targetDept: 'Hardware & Embedded Systems',
    participants: ['Sarah Connor (PC001)', 'Michael Scott (TL001)'],
    date: '2026-07-31',
    time: '10:00 AM',
    agenda: 'Review Hardware & Embedded Systems material shortage and pending satellite node tasks.',
    status: 'Pending Meeting'
  }
];

// Initial Seed Chat Messages for PM Team & Executives
const DEFAULT_CHAT_MESSAGES = [
  {
    id: 'MSG-1',
    senderId: 'CEO001',
    senderName: 'Alexander Vance (CEO)',
    senderRole: 'CEO/FOUNDER/DIRECTOR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: 'Team, please review the Q3 Hardware & Software milestone deliverables for Project Apollo.',
    timestamp: '10:15 AM'
  },
  {
    id: 'MSG-2',
    senderId: 'PC001',
    senderName: 'Sarah Connor (PC)',
    senderRole: 'PROJECT_COORDINATOR',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    text: 'Received. All work transfer requests for Hardware and Software teams have been allocated.',
    timestamp: '10:18 AM'
  }
];

export const initDatabase = () => {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!usersJson) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(DEFAULT_LEAVES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATERIALS)) {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(DEFAULT_MATERIALS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORK_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(DEFAULT_WORK_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEETINGS)) {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(DEFAULT_MEETINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(DEFAULT_CHAT_MESSAGES));
  }
};

const triggerStorageEvent = (key) => {
  window.dispatchEvent(new CustomEvent('mra_db_updated', { detail: { key } }));
};

// Users API
export const getUsers = () => {
  initDatabase();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};

export const registerUser = (user) => {
  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
  if (exists) {
    throw new Error('User ID or Email already registered.');
  }
  const newUser = {
    ...user,
    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  triggerStorageEvent(STORAGE_KEYS.USERS);
  return newUser;
};

// Leaves API
export const getLeaves = () => {
  initDatabase();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
};

export const addLeaveRequest = (leaveData) => {
  const leaves = getLeaves();
  const newLeave = {
    id: `LV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    ...leaveData,
    appliedDate: new Date().toLocaleString(),
    acceptedDate: '—',
    status: 'Pending',
    approvedBy: 'Pending Review'
  };
  leaves.unshift(newLeave);
  localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  triggerStorageEvent(STORAGE_KEYS.LEAVES);
  return newLeave;
};

export const updateLeaveStatus = (leaveId, status, approverName) => {
  const leaves = getLeaves();
  const idx = leaves.findIndex(l => l.id === leaveId);
  if (idx !== -1) {
    leaves[idx].status = status;
    leaves[idx].approvedBy = `${approverName}`;
    leaves[idx].acceptedDate = new Date().toLocaleString();
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
    triggerStorageEvent(STORAGE_KEYS.LEAVES);
  }
};

// Materials API
export const getMaterials = () => {
  initDatabase();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
};

export const addMaterialRequest = (matData) => {
  const materials = getMaterials();
  const now = new Date().toLocaleString();
  const newMaterial = {
    id: `MAT-${Math.floor(800 + Math.random() * 199)}`,
    ...matData,
    availableAtMoment: 'Checking',
    status: 'Pending Review',
    inventoryHandledBy: 'Pending Assignment',
    requestDate: now,
    reachedDate: now,
    acceptedDate: 'Pending',
    providedDate: 'Pending',
    orderPlacedDate: 'N/A',
    orderReceivedDate: 'N/A',
    noOfDaysToReceiveOrder: 'N/A',
    noOfDaysForProvidingMaterial: 'N/A',
    updates: 'Request submitted to TL / Inventory.'
  };
  materials.unshift(newMaterial);
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  triggerStorageEvent(STORAGE_KEYS.MATERIALS);
  return newMaterial;
};

export const updateMaterialStatus = (matId, updatesObj) => {
  const materials = getMaterials();
  const idx = materials.findIndex(m => m.id === matId);
  if (idx !== -1) {
    materials[idx] = { ...materials[idx], ...updatesObj };
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    triggerStorageEvent(STORAGE_KEYS.MATERIALS);
  }
};

// Work Logs API
export const getWorkLogs = () => {
  initDatabase();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORK_LOGS) || '[]');
};

export const addWorkLog = (workData) => {
  const logs = getWorkLogs();
  const newWork = {
    id: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
    ...workData,
    createdDate: new Date().toLocaleString(),
    acceptedDate: 'Pending',
    completedDate: 'Pending',
    status: 'Pending Acceptance',
    rejectionReason: ''
  };
  logs.unshift(newWork);
  localStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(logs));
  triggerStorageEvent(STORAGE_KEYS.WORK_LOGS);
  return newWork;
};

export const updateWorkLogStatus = (workId, status, extra = {}) => {
  const logs = getWorkLogs();
  const idx = logs.findIndex(w => w.id === workId);
  if (idx !== -1) {
    logs[idx].status = status;
    if (status.includes('Accepted')) {
      logs[idx].acceptedDate = new Date().toLocaleString();
    }
    if (status.includes('Completed')) {
      logs[idx].completedDate = new Date().toLocaleString();
    }
    logs[idx] = { ...logs[idx], ...extra };
    localStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(logs));
    triggerStorageEvent(STORAGE_KEYS.WORK_LOGS);
    return logs[idx];
  }
  return null;
};

// Meetings API
export const getMeetings = () => {
  initDatabase();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEETINGS) || '[]');
};

export const addMeetingLog = (meetingData) => {
  const meetings = getMeetings();
  const newMtg = {
    id: `MTG-${Math.floor(300 + Math.random() * 600)}`,
    ...meetingData,
    status: 'Pending Meeting'
  };
  meetings.unshift(newMtg);
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  triggerStorageEvent(STORAGE_KEYS.MEETINGS);
  return newMtg;
};

// Team Chat API
export const getChatMessages = () => {
  initDatabase();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES) || '[]');
};

export const sendChatMessage = (msgData) => {
  const messages = getChatMessages();
  const newMsg = {
    id: `MSG-${Date.now()}`,
    ...msgData,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  messages.push(newMsg);
  localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  triggerStorageEvent(STORAGE_KEYS.CHAT_MESSAGES);
  return newMsg;
};

// EXCEL / CSV DATA EXPORT SERVICE FOR CEO / FOUNDER / DIRECTOR ACCOUNTS
export const exportDatabaseExcelCSV = () => {
  const users = getUsers();
  const leaves = getLeaves();
  const materials = getMaterials();
  const workLogs = getWorkLogs();
  const meetings = getMeetings();

  let csvContent = 'data:text/csv;charset=utf-8,';

  // Section 1: Department & Employee Summary
  csvContent += '=== MRA SYNC ENTERPRISE REPORT ===\n';
  csvContent += 'Exported Date:,' + new Date().toLocaleString() + '\n\n';

  csvContent += '--- EMPLOYEE ROSTER & DEPARTMENT BREAKDOWN ---\n';
  csvContent += 'User ID,Full Name,Corporate Email,Role Designation,Department\n';
  users.forEach(u => {
    csvContent += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.dept}"\n`;
  });

  // Section 2: Work Transfer Logs
  csvContent += '\n--- WORK TRANSFER LOGS SHEET ---\n';
  csvContent += 'Task ID,Project Name,Work Alloter,Sender Dept,Target Receiver,Receiver Dept,Priority,Status,Created Date,Completed Date\n';
  workLogs.forEach(w => {
    csvContent += `"${w.id}","${w.projectName}","${w.workAlloter}","${w.fromDept}","${w.receiverName}","${w.toDept}","${w.requirement}","${w.status}","${w.createdDate}","${w.completedDate}"\n`;
  });

  // Section 3: Leave Applications
  csvContent += '\n--- LEAVE APPLICATIONS SHEET ---\n';
  csvContent += 'Leave ID,Employee ID,Employee Name,Department,Leave Type,From-To Dates,No Of Days,Purpose,Status,Approved By\n';
  leaves.forEach(l => {
    csvContent += `"${l.id}","${l.empId}","${l.name}","${l.dept}","${l.leaveType}","${l.fromTo}","${l.noOfDays}","${l.purpose}","${l.status}","${l.approvedBy}"\n`;
  });

  // Section 4: Material Requisitions
  csvContent += '\n--- MATERIAL & INVENTORY SHEET ---\n';
  csvContent += 'Req ID,Requester,Department,Target TL,Material Type,Quantity,Project,Stock Available,Status,Updates\n';
  materials.forEach(m => {
    csvContent += `"${m.id}","${m.empName}","${m.deptName}","${m.targetTLName}","${m.materialType}","${m.noOfUnits}","${m.forProject}","${m.availableAtMoment}","${m.status}","${m.updates}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `MRA_SYNC_Enterprise_Backend_Logs_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDatabaseJSON = () => {
  const data = {
    users: getUsers(),
    leaves: getLeaves(),
    materials: getMaterials(),
    workLogs: getWorkLogs(),
    meetings: getMeetings(),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MRA_SYNC_Backend_Database_Backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
};

export const resetDatabaseToDefaults = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(DEFAULT_LEAVES));
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(DEFAULT_MATERIALS));
  localStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(DEFAULT_WORK_LOGS));
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(DEFAULT_MEETINGS));
  localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(DEFAULT_CHAT_MESSAGES));
  triggerStorageEvent(STORAGE_KEYS.USERS);
  triggerStorageEvent(STORAGE_KEYS.LEAVES);
  triggerStorageEvent(STORAGE_KEYS.MATERIALS);
  triggerStorageEvent(STORAGE_KEYS.WORK_LOGS);
  triggerStorageEvent(STORAGE_KEYS.MEETINGS);
  triggerStorageEvent(STORAGE_KEYS.CHAT_MESSAGES);
};

export const deleteRecordFromSheet = (sheetKey, recordId) => {
  let key;
  if (sheetKey === 'leaves') key = STORAGE_KEYS.LEAVES;
  if (sheetKey === 'materials') key = STORAGE_KEYS.MATERIALS;
  if (sheetKey === 'workLogs') key = STORAGE_KEYS.WORK_LOGS;
  if (sheetKey === 'users') key = STORAGE_KEYS.USERS;
  if (sheetKey === 'meetings') key = STORAGE_KEYS.MEETINGS;

  if (key) {
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = list.filter(item => item.id !== recordId);
    localStorage.setItem(key, JSON.stringify(filtered));
    triggerStorageEvent(key);
  }
};
