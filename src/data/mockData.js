// src/data/mockData.js
// Mock data layer — swap these for real API calls when a backend is connected.

/* ==================== PROJECTS ==================== */
export const PROJECTS = [
  {
    id: 'matrimony',
    name: 'Matrimony CRM',
    code: 'MAT',
    businessType: 'Matrimony Services',
    logo: null,
    contactEmail: 'contact@matrimony.com',
    contactPhone: '9876543210',
    domain: 'matrimony.eliteinova.com',
    businessHours: '09:00 – 19:00',
    timezone: 'IST',
    plan: 'Business',
    status: 'Active',
    ivrNumber: '9876543210',
    expiresOn: '30 Nov 2026',
    assignedAdminId: 'admin-1',
  },
  {
    id: 'property',
    name: 'Property CRM',
    code: 'PROP',
    businessType: 'Real Estate',
    domain: 'property.eliteinova.com',
    plan: 'Growth',
    status: 'Active',
    ivrNumber: '9876543210',
    expiresOn: '14 Jan 2027',
    assignedAdminId: 'admin-2',
  },
  {
    id: 'insurance',
    name: 'Insurance CRM',
    code: 'INS',
    businessType: 'Insurance',
    plan: 'Starter',
    status: 'Trial',
    ivrNumber: '9876543210',
    expiresOn: '02 Mar 2026',
    assignedAdminId: 'admin-3',
  },
];

export const WEBSITES = PROJECTS;

/* ==================== USERS ==================== */
export const USERS = [
  { id: 'sa-1', username: '900001', password: 'super@123', role: 'superadmin', name: 'SuperAdmin', websiteId: null, avatar: 'SA' },
  { id: 'admin-1', username: '620472', password: 'admin@123', role: 'admin', name: 'Admin1', websiteId: 'matrimony', avatar: 'A1' },
  { id: 'agent-1', username: '69793@123', password: 'agent@123', role: 'agent', name: 'Agent1', websiteId: 'matrimony', avatar: 'A1' },
];

/* ==================== ADMINS ==================== */
export const ADMINS = [
  { id: 'admin-1', name: 'Admin1', username: '620472', email: 'admin1@eliteinova.com', phone: '9876543210', projectId: 'matrimony', status: 'Active', lastLogin: 'Today, 10:24 AM', loginCount: 124 },
  { id: 'admin-2', name: 'Admin2', username: '620473', email: 'admin2@eliteinova.com', phone: '9876543210', projectId: 'property', status: 'Active', lastLogin: 'Yesterday', loginCount: 89 },
  { id: 'admin-3', name: 'Admin3', username: '620474', email: 'admin3@eliteinova.com', phone: '9876543210', projectId: 'insurance', status: 'Inactive', lastLogin: '5 days ago', loginCount: 42 },
];

/* ==================== AGENTS ==================== */
export const AGENTS = [
  { id: 1, name: 'Agent1', phone: '9876543210', email: 'agent1@eliteinova.com', status: 'Active', leadsAssigned: 1, callsToday: 0, websiteId: 'matrimony', team: 'Sales A', joinedOn: '2024-01-15' },
  { id: 2, name: 'Agent2', phone: '9876543211', email: 'agent2@eliteinova.com', status: 'Active', leadsAssigned: 4, callsToday: 6, websiteId: 'matrimony', team: 'Sales A', joinedOn: '2024-02-20' },
  { id: 3, name: 'Agent3', phone: '9876543212', email: 'agent3@eliteinova.com', status: 'Break', leadsAssigned: 2, callsToday: 3, websiteId: 'property', team: 'Sales B', joinedOn: '2024-03-10' },
  { id: 4, name: 'Agent4', phone: '9876543213', email: 'agent4@eliteinova.com', status: 'Active', leadsAssigned: 5, callsToday: 8, websiteId: 'matrimony', team: 'Sales B', joinedOn: '2024-04-05' },
  { id: 5, name: 'Agent5', phone: '9876543214', email: 'agent5@eliteinova.com', status: 'Offline', leadsAssigned: 0, callsToday: 0, websiteId: 'insurance', team: 'Support', joinedOn: '2024-05-12' },
];

/* ==================== TEAMS ==================== */
export const TEAMS = [
  { id: 'team-1', name: 'Sales A', projectId: 'matrimony', leaderId: 1, agentIds: [1, 2, 4], description: 'Matrimony sales team A' },
  { id: 'team-2', name: 'Sales B', projectId: 'property', leaderId: 3, agentIds: [3], description: 'Property sales team B' },
  { id: 'team-3', name: 'Support', projectId: 'insurance', leaderId: 5, agentIds: [5], description: 'Insurance support team' },
];

/* ==================== LEADS ==================== */
export const LEADS = [
  { id: 1, sNo: 1, leadSource: 'IVR', category: 'IVR Inbound', name: 'Venu Gopal Subramani', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'Agent1', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'matrimony', notes: [] },
  { id: 2, sNo: 2, leadSource: 'Website', category: 'Landing Page', name: 'Kavitha Muthu', mobile: '9876543210', account: 'Eliteinova Sep form-copy', assignedAgent: 'Agent1', followUpDate: '12 Sep 2026', status: 'Follow Up', websiteId: 'matrimony', notes: [] },
  { id: 3, sNo: 3, leadSource: 'IVR', category: 'IVR Missed', name: 'Ramesh Kannan', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'Agent2', followUpDate: '—', status: 'Missed', websiteId: 'matrimony', notes: [] },
  { id: 4, sNo: 1, leadSource: 'WhatsApp', category: 'Campaign', name: 'Priya Sundaram', mobile: '9876543210', account: 'OrbitMart Q3 campaign', assignedAgent: 'Agent3', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'property', notes: [] },
  { id: 5, sNo: 4, leadSource: 'IVR', category: 'IVR Inbound', name: 'Venu Gopal Subramani', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'Agent1', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'matrimony', notes: [] },
  { id: 6, sNo: 5, leadSource: 'Google Ads', category: 'Paid Lead', name: 'Anita Rao', mobile: '9876500011', account: 'Google Ads Aug-2026', assignedAgent: 'Agent4', followUpDate: '15 Sep 2026', status: 'Won', websiteId: 'matrimony', notes: [] },
  { id: 7, sNo: 6, leadSource: 'Referral', category: 'Warm Lead', name: 'Suresh Babu', mobile: '9876500022', account: 'Referral by Rajesh', assignedAgent: 'Agent4', followUpDate: '—', status: 'Lost', websiteId: 'matrimony', notes: [] },
  { id: 8, sNo: 7, leadSource: 'Website', category: 'Landing Page', name: 'Deepak Nair', mobile: '9876500033', account: 'Property form-copy', assignedAgent: null, followUpDate: '—', status: 'Fresh', websiteId: 'property', notes: [] },
];

/* ==================== CALLS ==================== */
export const CALLS = [
  { id: 'C-001', projectId: 'matrimony', agent: 'Agent1', customer: 'Venu Gopal', mobile: '9876543210', type: 'inbound', status: 'connected', duration: '3:42', date: '2026-09-22', disposition: 'Interested' },
  { id: 'C-002', projectId: 'matrimony', agent: 'Agent1', customer: 'Kavitha M', mobile: '9876543211', type: 'outbound', status: 'connected', duration: '1:18', date: '2026-09-22', disposition: 'Follow Up' },
  { id: 'C-003', projectId: 'matrimony', agent: 'Agent2', customer: 'Ramesh K', mobile: '9876543212', type: 'inbound', status: 'missed', duration: '0:00', date: '2026-09-22', disposition: 'No Answer' },
  { id: 'C-004', projectId: 'property', agent: 'Agent3', customer: 'Priya S', mobile: '9876543213', type: 'outbound', status: 'connected', duration: '5:04', date: '2026-09-21', disposition: 'Converted' },
  { id: 'C-005', projectId: 'matrimony', agent: 'Agent4', customer: 'Anita R', mobile: '9876500011', type: 'inbound', status: 'connected', duration: '2:30', date: '2026-09-25', disposition: 'Interested' },
  { id: 'C-006', projectId: 'matrimony', agent: 'Agent4', customer: 'Suresh B', mobile: '9876500022', type: 'outbound', status: 'missed', duration: '0:00', date: '2026-09-24', disposition: 'No Answer' },
];

/* ==================== LIVE CALLS ==================== */
export const LIVE_CALLS = [
  { id: 'LC-001', projectId: 'matrimony', agent: 'Agent1', customer: 'Venu Gopal', mobile: '9876543210', type: 'inbound', status: 'talking', duration: '2:14', startedAt: '10:42 AM' },
  { id: 'LC-002', projectId: 'matrimony', agent: 'Agent4', customer: 'Anita Rao', mobile: '9876500011', type: 'outbound', status: 'ringing', duration: '0:08', startedAt: '10:45 AM' },
  { id: 'LC-003', projectId: 'property', agent: 'Agent3', customer: 'Priya S', mobile: '9876543213', type: 'inbound', status: 'on-hold', duration: '1:02', startedAt: '10:40 AM' },
];

/* ==================== FOLLOW-UPS ==================== */
export const FOLLOW_UPS = [
  { id: 'F-001', projectId: 'matrimony', leadId: 1, leadName: 'Venu Gopal', mobile: '9876543210', agent: 'Agent1', date: '2026-09-22', time: '11:00 AM', status: 'Today' },
  { id: 'F-002', projectId: 'matrimony', leadId: 2, leadName: 'Kavitha M', mobile: '9876543211', agent: 'Agent1', date: '2026-09-24', time: '02:00 PM', status: 'Upcoming' },
  { id: 'F-003', projectId: 'matrimony', leadId: 3, leadName: 'Ramesh K', mobile: '9876543212', agent: 'Agent2', date: '2026-09-20', time: '10:00 AM', status: 'Overdue' },
  { id: 'F-004', projectId: 'property', leadId: 4, leadName: 'Priya S', mobile: '9876543213', agent: 'Agent3', date: '2026-09-22', time: '04:00 PM', status: 'Today' },
  { id: 'F-005', projectId: 'matrimony', leadId: 6, leadName: 'Anita R', mobile: '9876500011', agent: 'Agent4', date: '2026-09-25', time: '11:30 AM', status: 'Completed' },
];

/* ==================== CAMPAIGNS ==================== */
export const CAMPAIGNS = [
  { id: 'CMP-001', name: 'Q3 Matrimony Outreach', projectId: 'matrimony', leads: 500, calls: 320, connected: 240, interested: 68, converted: 22, status: 'Active', startDate: '2026-09-01', endDate: '2026-09-30' },
  { id: 'CMP-002', name: 'Property Lead Boost', projectId: 'property', leads: 800, calls: 450, connected: 320, interested: 95, converted: 34, status: 'Active', startDate: '2026-09-10', endDate: '2026-10-10' },
  { id: 'CMP-003', name: 'Insurance Renewals', projectId: 'insurance', leads: 200, calls: 180, connected: 140, interested: 42, converted: 18, status: 'Completed', startDate: '2026-08-01', endDate: '2026-08-31' },
];

/* ==================== COMMUNICATIONS ==================== */
export const COMMUNICATIONS = [
  { id: 'MSG-001', projectId: 'matrimony', channel: 'SMS', to: '9876543210', message: 'Your appointment is confirmed', status: 'Delivered', date: '2026-09-22 10:15 AM' },
  { id: 'MSG-002', projectId: 'matrimony', channel: 'WhatsApp', to: '9876543210', message: 'Thanks for your enquiry', status: 'Read', date: '2026-09-22 09:40 AM' },
  { id: 'MSG-003', projectId: 'property', channel: 'Email', to: 'priya@example.com', message: 'Property brochure attached', status: 'Sent', date: '2026-09-21 05:20 PM' },
  { id: 'MSG-004', projectId: 'matrimony', channel: 'SMS', to: '9876543210', message: 'Missed call from Eliteinova', status: 'Failed', date: '2026-09-21 03:10 PM' },
];

/* ==================== TEMPLATES ==================== */
export const TEMPLATES = [
  { id: 'TPL-001', projectId: 'matrimony', channel: 'SMS', name: 'Welcome Message', body: 'Hi {{name}}, welcome to our service! Reply YES to confirm.', status: 'Active', updatedAt: '2026-09-20' },
  { id: 'TPL-002', projectId: 'matrimony', channel: 'SMS', name: 'Follow-up Reminder', body: 'Hi {{name}}, just following up on your enquiry. Do you have a moment?', status: 'Active', updatedAt: '2026-09-18' },
  { id: 'TPL-003', projectId: 'matrimony', channel: 'WhatsApp', name: 'Enquiry Reply', body: 'Hello {{name}}, thanks for your interest. Our team will call you shortly.', status: 'Active', updatedAt: '2026-09-15' },
  { id: 'TPL-004', projectId: 'matrimony', channel: 'Email', name: 'Proposal Email', body: 'Dear {{name}},\n\nPlease find attached our proposal.\n\nBest regards,\n{{sender}}', status: 'Active', updatedAt: '2026-09-12' },
  { id: 'TPL-005', projectId: 'property', channel: 'SMS', name: 'Site Visit Confirmation', body: 'Your site visit is confirmed for {{date}} at {{time}}.', status: 'Active', updatedAt: '2026-09-10' },
];

/* ==================== TASKS ==================== */
export const TASKS = [
  { id: 'TSK-001', projectId: 'matrimony', title: 'Review Q3 lead quality', description: 'Audit lead sources for Q3', assignedTo: 'Admin1', dueDate: '2026-09-28', priority: 'High', status: 'In Progress', createdAt: '2026-09-20' },
  { id: 'TSK-002', projectId: 'matrimony', title: 'Approve new IVR menu', description: 'Review and approve updated IVR options', assignedTo: 'Admin1', dueDate: '2026-09-26', priority: 'Medium', status: 'Pending', createdAt: '2026-09-19' },
  { id: 'TSK-003', projectId: 'matrimony', title: 'Weekly agent performance review', description: 'Prepare weekly performance summary', assignedTo: 'Admin1', dueDate: '2026-09-25', priority: 'High', status: 'Completed', createdAt: '2026-09-18' },
  { id: 'TSK-004', projectId: 'property', title: 'Renew SSL certificate', description: 'Renew domain SSL before expiry', assignedTo: 'Admin2', dueDate: '2026-10-05', priority: 'Low', status: 'Pending', createdAt: '2026-09-15' },
];

/* ==================== REMINDERS ==================== */
export const REMINDERS = [
  { id: 'REM-001', projectId: 'matrimony', title: 'Call top 10 leads today', time: '2026-09-25 10:00 AM', type: 'Call', status: 'Upcoming' },
  { id: 'REM-002', projectId: 'matrimony', title: 'Submit weekly report', time: '2026-09-25 05:00 PM', type: 'Task', status: 'Upcoming' },
  { id: 'REM-003', projectId: 'matrimony', title: 'Follow-up with Anita R', time: '2026-09-25 11:30 AM', type: 'Follow-up', status: 'Completed' },
  { id: 'REM-004', projectId: 'matrimony', title: 'Team meeting', time: '2026-09-26 09:00 AM', type: 'Meeting', status: 'Upcoming' },
];

/* ==================== NOTIFICATIONS ==================== */
export const NOTIFICATIONS = [
  { id: 'N-001', projectId: 'matrimony', title: 'New lead assigned', body: 'Lead "Anita Rao" was assigned to Agent4', type: 'assignment', read: false, time: '10 min ago' },
  { id: 'N-002', projectId: 'matrimony', title: 'Missed call alert', body: 'Inbound call from +91 98765 00022 missed', type: 'missed_call', read: false, time: '25 min ago' },
  { id: 'N-003', projectId: 'matrimony', title: 'Follow-up overdue', body: 'Follow-up for "Ramesh K" is overdue', type: 'follow_up', read: true, time: '2 hours ago' },
  { id: 'N-004', projectId: 'matrimony', title: 'Campaign completed', body: 'Campaign "Q3 Matrimony Outreach" reached 100%', type: 'campaign', read: true, time: '1 day ago' },
];

/* ==================== LEAD SOURCES ==================== */
export const LEAD_SOURCES = [
  { id: 'src-website', name: 'Website', projectId: 'matrimony', active: true },
  { id: 'src-google', name: 'Google Ads', projectId: 'matrimony', active: true },
  { id: 'src-meta', name: 'Meta Ads', projectId: 'matrimony', active: true },
  { id: 'src-ig', name: 'Instagram', projectId: 'matrimony', active: true },
  { id: 'src-fb', name: 'Facebook', projectId: 'matrimony', active: true },
  { id: 'src-wa', name: 'WhatsApp', projectId: 'matrimony', active: true },
  { id: 'src-call', name: 'Phone Call', projectId: 'matrimony', active: true },
  { id: 'src-referral', name: 'Referral', projectId: 'matrimony', active: true },
  { id: 'src-walkin', name: 'Walk-in', projectId: 'matrimony', active: true },
  { id: 'src-campaign', name: 'Campaign', projectId: 'matrimony', active: true },
  { id: 'src-other', name: 'Other', projectId: 'matrimony', active: true },
];

/* ==================== LEAD CATEGORIES ==================== */
export const LEAD_CATEGORIES = [
  { id: 'cat-1', name: 'New Registration', projectId: 'matrimony', active: true },
  { id: 'cat-2', name: 'Paid Member', projectId: 'matrimony', active: true },
  { id: 'cat-3', name: 'Free Member', projectId: 'matrimony', active: true },
  { id: 'cat-4', name: 'Premium Enquiry', projectId: 'matrimony', active: true },
  { id: 'cat-5', name: 'Marriage Enquiry', projectId: 'matrimony', active: true },
  { id: 'cat-6', name: 'Verification Enquiry', projectId: 'matrimony', active: true },
  { id: 'cat-7', name: 'Customer Support', projectId: 'matrimony', active: true },
];

/* ==================== LEAD STATUSES ==================== */
export const LEAD_STATUSES = [
  { id: 'st-1', name: 'New', color: 'violet', projectId: 'matrimony', order: 1 },
  { id: 'st-2', name: 'Contacted', color: 'blue', projectId: 'matrimony', order: 2 },
  { id: 'st-3', name: 'Interested', color: 'emerald', projectId: 'matrimony', order: 3 },
  { id: 'st-4', name: 'Follow Up', color: 'amber', projectId: 'matrimony', order: 4 },
  { id: 'st-5', name: 'Qualified', color: 'purple', projectId: 'matrimony', order: 5 },
  { id: 'st-6', name: 'Converted', color: 'emerald', projectId: 'matrimony', order: 6 },
  { id: 'st-7', name: 'No Answer', color: 'gray', projectId: 'matrimony', order: 7 },
  { id: 'st-8', name: 'Busy', color: 'gray', projectId: 'matrimony', order: 8 },
  { id: 'st-9', name: 'Call Back', color: 'amber', projectId: 'matrimony', order: 9 },
  { id: 'st-10', name: 'Not Interested', color: 'rose', projectId: 'matrimony', order: 10 },
  { id: 'st-11', name: 'Invalid Number', color: 'gray', projectId: 'matrimony', order: 11 },
  { id: 'st-12', name: 'Lost', color: 'rose', projectId: 'matrimony', order: 12 },
  { id: 'st-13', name: 'Closed', color: 'gray', projectId: 'matrimony', order: 13 },
];

/* ==================== LEAD STAGES ==================== */
export const LEAD_STAGES = [
  { id: 'stage-1', name: 'Enquiry', projectId: 'matrimony', order: 1 },
  { id: 'stage-2', name: 'Contacted', projectId: 'matrimony', order: 2 },
  { id: 'stage-3', name: 'Interested', projectId: 'matrimony', order: 3 },
  { id: 'stage-4', name: 'Negotiation', projectId: 'matrimony', order: 4 },
  { id: 'stage-5', name: 'Closed', projectId: 'matrimony', order: 5 },
];

/* ==================== CUSTOM FIELDS ==================== */
export const CUSTOM_FIELDS = [
  { id: 'cf-1', name: 'Gender', type: 'Dropdown', options: ['Male', 'Female', 'Other'], projectId: 'matrimony', required: true },
  { id: 'cf-2', name: 'Age', type: 'Number', projectId: 'matrimony', required: false },
  { id: 'cf-3', name: 'Religion', type: 'Text', projectId: 'matrimony', required: false },
  { id: 'cf-4', name: 'Community', type: 'Text', projectId: 'matrimony', required: false },
  { id: 'cf-5', name: 'Location', type: 'Text', projectId: 'matrimony', required: false },
  { id: 'cf-6', name: 'Education', type: 'Dropdown', options: ['UG', 'PG', 'Doctorate', 'Diploma', 'Other'], projectId: 'matrimony', required: false },
  { id: 'cf-7', name: 'Profession', type: 'Text', projectId: 'matrimony', required: false },
  { id: 'cf-8', name: 'Monthly Income', type: 'Number', projectId: 'matrimony', required: false },
  { id: 'cf-9', name: 'Marital Status', type: 'Dropdown', options: ['Never Married', 'Divorced', 'Widowed'], projectId: 'matrimony', required: true },
];

/* ==================== IVR CONFIG ==================== */
export const IVR_CONFIGS = [
  { projectId: 'matrimony', ivrNumber: '9876543210', welcomeMessage: 'Welcome to Matrimony CRM', menuOptions: ['Sales', 'Support', 'Accounts'], businessHours: '09:00 – 19:00', recording: true, voicemail: true },
  { projectId: 'property', ivrNumber: '9876543210', welcomeMessage: 'Welcome to Property CRM', menuOptions: ['Sales', 'Site Visit', 'Support'], businessHours: '09:00 – 18:00', recording: true, voicemail: false },
  { projectId: 'insurance', ivrNumber: '9876543210', welcomeMessage: 'Welcome to Insurance CRM', menuOptions: ['Sales', 'Renewals', 'Claims'], businessHours: '09:00 – 18:00', recording: false, voicemail: true },
];

/* ==================== DEPARTMENTS ==================== */
export const DEPARTMENTS = [
  { id: 'dept-1', name: 'Sales', projectId: 'matrimony', extension: '101', agents: ['Agent1', 'Agent2', 'Agent4'], active: true },
  { id: 'dept-2', name: 'Support', projectId: 'matrimony', extension: '102', agents: ['Agent3'], active: true },
  { id: 'dept-3', name: 'Accounts', projectId: 'matrimony', extension: '103', agents: [], active: true },
  { id: 'dept-4', name: 'Sales', projectId: 'property', extension: '201', agents: ['Agent3'], active: true },
  { id: 'dept-5', name: 'Site Visit', projectId: 'property', extension: '202', agents: [], active: true },
  { id: 'dept-6', name: 'Support', projectId: 'property', extension: '203', agents: [], active: false },
  { id: 'dept-7', name: 'Sales', projectId: 'insurance', extension: '301', agents: ['Agent5'], active: true },
  { id: 'dept-8', name: 'Renewals', projectId: 'insurance', extension: '302', agents: [], active: true },
  { id: 'dept-9', name: 'Claims', projectId: 'insurance', extension: '303', agents: [], active: true },
];

/* ==================== IVR MENUS ==================== */
export const IVR_MENUS = [
  {
    id: 'menu-1',
    projectId: 'matrimony',
    title: 'Main Menu',
    prompt: 'Press 1 for Sales, Press 2 for Support, Press 3 for Accounts',
    options: [
      { key: '1', label: 'Sales', action: 'route_department', target: 'Sales' },
      { key: '2', label: 'Support', action: 'route_department', target: 'Support' },
      { key: '3', label: 'Accounts', action: 'route_department', target: 'Accounts' },
      { key: '0', label: 'Talk to Agent', action: 'route_queue', target: 'default_queue' },
    ],
    active: true,
  },
  {
    id: 'menu-2',
    projectId: 'property',
    title: 'Main Menu',
    prompt: 'Press 1 for Sales, Press 2 for Site Visit, Press 3 for Support',
    options: [
      { key: '1', label: 'Sales', action: 'route_department', target: 'Sales' },
      { key: '2', label: 'Site Visit', action: 'route_department', target: 'Site Visit' },
      { key: '3', label: 'Support', action: 'route_department', target: 'Support' },
      { key: '0', label: 'Voicemail', action: 'voicemail', target: null },
    ],
    active: true,
  },
  {
    id: 'menu-3',
    projectId: 'insurance',
    title: 'Main Menu',
    prompt: 'Press 1 for Sales, Press 2 for Renewals, Press 3 for Claims',
    options: [
      { key: '1', label: 'Sales', action: 'route_department', target: 'Sales' },
      { key: '2', label: 'Renewals', action: 'route_department', target: 'Renewals' },
      { key: '3', label: 'Claims', action: 'route_department', target: 'Claims' },
      { key: '0', label: 'Talk to Agent', action: 'route_queue', target: 'default_queue' },
    ],
    active: true,
  },
];

/* ==================== CALL QUEUES ==================== */
export const CALL_QUEUES = [
  { id: 'queue-1', projectId: 'matrimony', name: 'Sales Queue', strategy: 'Round Robin', maxWaitTime: 60, agents: ['Agent1', 'Agent2', 'Agent4'], active: true },
  { id: 'queue-2', projectId: 'matrimony', name: 'Support Queue', strategy: 'Longest Idle', maxWaitTime: 90, agents: ['Agent3'], active: true },
  { id: 'queue-3', projectId: 'property', name: 'Property Sales Queue', strategy: 'Round Robin', maxWaitTime: 60, agents: ['Agent3'], active: true },
  { id: 'queue-4', projectId: 'insurance', name: 'Insurance Sales Queue', strategy: 'Round Robin', maxWaitTime: 60, agents: ['Agent5'], active: true },
];

/* ==================== INTEGRATIONS ==================== */
export const INTEGRATIONS = [
  { id: 'INT-001', name: 'Exotel Telephony', category: 'Telephony', status: 'Connected', apiKey: 'exo_live_****1234' },
  { id: 'INT-002', name: 'Twilio SMS', category: 'SMS', status: 'Connected', apiKey: 'twl_****5678' },
  { id: 'INT-003', name: 'WhatsApp Business API', category: 'WhatsApp', status: 'Connected', apiKey: 'wa_****9012' },
  { id: 'INT-004', name: 'SendGrid Email', category: 'Email', status: 'Disconnected', apiKey: '' },
  { id: 'INT-005', name: 'Razorpay', category: 'Payment', status: 'Connected', apiKey: 'rzp_****3456' },
];

/* ==================== CREDITS ==================== */
export const CREDITS = [
  {
    id: 'CR-001',
    projectId: 'matrimony',
    projectName: 'Matrimony CRM',
    plan: 'Business',
    totalCredits: 50000,
    usedCredits: 32450,
    remainingCredits: 17550,
    callsUsed: 18420,
    smsUsed: 9120,
    whatsappUsed: 4910,
    emailUsed: 0,
    renewalDate: '30 Nov 2026',
    status: 'Active',
    lastUpdated: '2026-09-25',
  },
  {
    id: 'CR-002',
    projectId: 'property',
    projectName: 'Property CRM',
    plan: 'Growth',
    totalCredits: 25000,
    usedCredits: 13890,
    remainingCredits: 11110,
    callsUsed: 7420,
    smsUsed: 4210,
    whatsappUsed: 2260,
    emailUsed: 0,
    renewalDate: '14 Jan 2027',
    status: 'Active',
    lastUpdated: '2026-09-25',
  },
  {
    id: 'CR-003',
    projectId: 'insurance',
    projectName: 'Insurance CRM',
    plan: 'Starter',
    totalCredits: 10000,
    usedCredits: 8940,
    remainingCredits: 1060,
    callsUsed: 6120,
    smsUsed: 1980,
    whatsappUsed: 840,
    emailUsed: 0,
    renewalDate: '02 Mar 2026',
    status: 'Low Balance',
    lastUpdated: '2026-09-25',
  },
];

/* ==================== CREDIT TRANSACTIONS ==================== */
export const CREDIT_TRANSACTIONS = [
  { id: 'CTX-001', projectId: 'matrimony', type: 'debit', category: 'Calls', amount: 120, balance: 17550, description: 'Outbound campaign calls', date: '2026-09-25 10:30 AM' },
  { id: 'CTX-002', projectId: 'matrimony', type: 'debit', category: 'SMS', amount: 45, balance: 17670, description: 'Follow-up SMS batch', date: '2026-09-25 09:15 AM' },
  { id: 'CTX-003', projectId: 'matrimony', type: 'credit', category: 'Top-up', amount: 5000, balance: 17715, description: 'Monthly credit top-up', date: '2026-09-24 06:00 PM' },
  { id: 'CTX-004', projectId: 'property', type: 'debit', category: 'WhatsApp', amount: 80, balance: 11110, description: 'WhatsApp template messages', date: '2026-09-24 04:20 PM' },
  { id: 'CTX-005', projectId: 'insurance', type: 'debit', category: 'Calls', amount: 200, balance: 1060, description: 'Renewal reminder calls', date: '2026-09-23 02:10 PM' },
];

/* ==================== SYSTEM LOGS ==================== */
export const SYSTEM_LOGS = [
  { id: 'LOG-001', at: '2026-09-22 10:24 AM', user: 'Admin1', role: 'admin', projectId: 'matrimony', action: 'Lead created', target: 'Lead #5' },
  { id: 'LOG-002', at: '2026-09-22 10:10 AM', user: 'Agent1', role: 'agent', projectId: 'matrimony', action: 'Call logged', target: 'Call #C-002' },
  { id: 'LOG-003', at: '2026-09-22 09:55 AM', user: 'SuperAdmin', role: 'superadmin', projectId: null, action: 'Project created', target: 'Insurance CRM' },
  { id: 'LOG-004', at: '2026-09-21 06:30 PM', user: 'Admin2', role: 'admin', projectId: 'property', action: 'Campaign started', target: 'CMP-002' },
];

/* ==================== CUSTOMERS ==================== */
export const CUSTOMERS = [
  { id: 'CU-001', name: 'Venu Gopal', mobile: '9876543210', email: 'venu@example.com', projectId: 'matrimony', totalCalls: 12, totalLeads: 2, status: 'Active' },
  { id: 'CU-002', name: 'Priya Sundaram', mobile: '9876543213', email: 'priya@example.com', projectId: 'property', totalCalls: 8, totalLeads: 1, status: 'Active' },
  { id: 'CU-003', name: 'Kavitha M', mobile: '9876543211', email: 'kavitha@example.com', projectId: 'matrimony', totalCalls: 5, totalLeads: 1, status: 'Active' },
];

/* ==================== TREND DATA ==================== */
export const DAILY_CALL_TREND = [
  { day: 'Sep 04', calls: 3 },
  { day: 'Sep 05', calls: 5 },
  { day: 'Sep 06', calls: 2 },
  { day: 'Sep 07', calls: 6 },
  { day: 'Sep 08', calls: 4 },
  { day: 'Sep 09', calls: 0 },
  { day: 'Sep 10', calls: 1 },
];

// appended to src/data/mockData.js
export const TODAY_FOLLOWUPS = [
  { id: 1, name: 'Customer A', time: '10:00 AM', purpose: 'Callback' },
  { id: 2, name: 'Customer B', time: '11:30 AM', purpose: 'Product enquiry' },
  { id: 3, name: 'Customer C', time: '02:00 PM', purpose: 'Payment follow-up' },
];

export const RECENT_CALLS = [
  { id: 1, name: 'Customer B', type: 'outbound', outcome: 'Interested', duration: '04:20' },
  { id: 2, name: 'Customer C', type: 'inbound',  outcome: 'Connected',  duration: '02:15' },
  { id: 3, name: 'Customer D', type: 'missed',   outcome: 'No Answer',  duration: '00:00' },
];

export const CALL_DISPOSITIONS = [
  'Connected', 'No Answer', 'Busy', 'Call Back', 'Interested',
  'Not Interested', 'Wrong Number', 'Converted', 'Follow-Up Required',
  'Customer Requested Information', 'Other',
];

/* ==================== REPORT / ANALYTICS DATA ==================== */
export const LEAD_SOURCE_REPORT = [
  { source: 'Website', leads: 1240, converted: 186, rate: 15.0 },
  { source: 'Google Ads', leads: 890, converted: 142, rate: 16.0 },
  { source: 'Meta Ads', leads: 720, converted: 98, rate: 13.6 },
  { source: 'IVR', leads: 640, converted: 84, rate: 13.1 },
  { source: 'Referral', leads: 310, converted: 72, rate: 23.2 },
  { source: 'Walk-in', leads: 180, converted: 46, rate: 25.6 },
];

export const AGENT_PERFORMANCE = [
  { agent: 'Agent1', leads: 42, calls: 128, followUps: 64, converted: 9, rate: 21.4 },
  { agent: 'Agent2', leads: 38, calls: 110, followUps: 58, converted: 7, rate: 18.4 },
  { agent: 'Agent3', leads: 30, calls: 92, followUps: 41, converted: 5, rate: 16.7 },
  { agent: 'Agent4', leads: 48, calls: 142, followUps: 76, converted: 12, rate: 25.0 },
  { agent: 'Agent5', leads: 22, calls: 61, followUps: 28, converted: 3, rate: 13.6 },
];

export const CALL_DISPOSITION_REPORT = [
  { disposition: 'Interested', count: 320, color: 'emerald' },
  { disposition: 'Follow Up', count: 280, color: 'amber' },
  { disposition: 'No Answer', count: 190, color: 'gray' },
  { disposition: 'Not Interested', count: 140, color: 'rose' },
  { disposition: 'Converted', count: 86, color: 'emerald' },
  { disposition: 'Busy', count: 62, color: 'gray' },
  { disposition: 'Call Back', count: 48, color: 'amber' },
];

/* ==================== HELPER FUNCTIONS ==================== */
export function statsForWebsite(websiteId) {
  const leads = LEADS.filter((l) => l.websiteId === websiteId);
  const agents = AGENTS.filter((a) => a.websiteId === websiteId);
  return {
    totalLeads: leads.length,
    totalCalls: CALLS.filter((c) => c.projectId === websiteId).length,
    missedCalls: leads.filter((l) => l.status === 'Missed').length,
    activeAgents: agents.filter((a) => a.status === 'Active').length,
    fresh: leads.filter((l) => l.status === 'Fresh').length,
    followUp: leads.filter((l) => l.status === 'Follow Up').length,
    missed: leads.filter((l) => l.status === 'Missed').length,
  };
}

export const statsForProject = statsForWebsite;

/* ==================== CREDIT HELPERS ==================== */
export function creditsForProject(projectId) {
  const c = CREDITS.find((x) => x.projectId === projectId);
  if (!c) return null;
  return {
    ...c,
    usagePercent: Math.round((c.usedCredits / c.totalCredits) * 100),
    remainingPercent: Math.round((c.remainingCredits / c.totalCredits) * 100),
  };
}

export function totalCreditStats() {
  const total = CREDITS.reduce((s, c) => s + c.totalCredits, 0);
  const used = CREDITS.reduce((s, c) => s + c.usedCredits, 0);
  const remaining = CREDITS.reduce((s, c) => s + c.remainingCredits, 0);
  return {
    total,
    used,
    remaining,
    usagePercent: total > 0 ? Math.round((used / total) * 100) : 0,
  };
}

export function creditTransactionsForProject(projectId) {
  return CREDIT_TRANSACTIONS.filter((t) => t.projectId === projectId);
}

/* ==================== IVR HELPERS ==================== */
export function ivrConfigForProject(projectId) {
  return IVR_CONFIGS.find((c) => c.projectId === projectId) || null;
}

export function departmentsForProject(projectId) {
  return DEPARTMENTS.filter((d) => d.projectId === projectId);
}

export function ivrMenuForProject(projectId) {
  return IVR_MENUS.find((m) => m.projectId === projectId) || null;
}

export function queuesForProject(projectId) {
  return CALL_QUEUES.filter((q) => q.projectId === projectId);
}