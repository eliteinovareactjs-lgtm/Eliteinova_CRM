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
    ivrNumber: '9940493726',
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
    ivrNumber: '9840112233',
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
    ivrNumber: '9677001122',
    expiresOn: '02 Mar 2026',
    assignedAdminId: 'admin-3',
  },
];

/* Keep WEBSITES as alias for backward compatibility */
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
  { id: 'admin-2', name: 'Admin2', username: '620473', email: 'admin2@eliteinova.com', phone: '9876543211', projectId: 'property', status: 'Active', lastLogin: 'Yesterday', loginCount: 89 },
  { id: 'admin-3', name: 'Admin3', username: '620474', email: 'admin3@eliteinova.com', phone: '9876543212', projectId: 'insurance', status: 'Inactive', lastLogin: '5 days ago', loginCount: 42 },
];

/* ==================== AGENTS ==================== */
export const AGENTS = [
  { id: 1, name: 'Agent1', phone: '9876543210', status: 'Active', leadsAssigned: 1, callsToday: 0, websiteId: 'matrimony' },
  { id: 2, name: 'Agent2', phone: '9876543210', status: 'Active', leadsAssigned: 4, callsToday: 6, websiteId: 'matrimony' },
  { id: 3, name: 'Agent3', phone: '9876543210', status: 'Break', leadsAssigned: 2, callsToday: 3, websiteId: 'property' },
];

/* ==================== LEADS ==================== */
export const LEADS = [
  { id: 1, sNo: 1, leadSource: 'IVR', category: 'IVR Inbound', name: 'Venu Gopal Subramani', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'Agent1', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'matrimony', notes: [] },
  { id: 2, sNo: 2, leadSource: 'Website', category: 'Landing Page', name: 'Kavitha Muthu', mobile: '9876543210', account: 'Eliteinova Sep form-copy', assignedAgent: 'Agent1', followUpDate: '12 Sep 2026', status: 'Follow Up', websiteId: 'matrimony', notes: [] },
  { id: 3, sNo: 3, leadSource: 'IVR', category: 'IVR Missed', name: 'Ramesh Kannan', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'Agent2', followUpDate: '—', status: 'Missed', websiteId: 'matrimony', notes: [] },
  { id: 4, sNo: 1, leadSource: 'WhatsApp', category: 'Campaign', name: 'Priya Sundaram', mobile: '9876543210', account: 'OrbitMart Q3 campaign', assignedAgent: 'Agent3', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'property', notes: [] },
  { id: 5, sNo: 4, leadSource: 'IVR', category: 'IVR Inbound', name: 'Venu Gopal Subramani', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'Agent1', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'matrimony', notes: [] },
];

/* ==================== CALLS ==================== */
export const CALLS = [
  { id: 'C-001', projectId: 'matrimony', agent: 'Agent1', customer: 'Venu Gopal', mobile: '9876543210', type: 'inbound', status: 'connected', duration: '3:42', date: '2026-09-22', disposition: 'Interested' },
  { id: 'C-002', projectId: 'matrimony', agent: 'Agent1', customer: 'Kavitha M', mobile: '9876543211', type: 'outbound', status: 'connected', duration: '1:18', date: '2026-09-22', disposition: 'Follow Up' },
  { id: 'C-003', projectId: 'matrimony', agent: 'Agent2', customer: 'Ramesh K', mobile: '9876543212', type: 'inbound', status: 'missed', duration: '0:00', date: '2026-09-22', disposition: 'No Answer' },
  { id: 'C-004', projectId: 'property', agent: 'Agent3', customer: 'Priya S', mobile: '9876543213', type: 'outbound', status: 'connected', duration: '5:04', date: '2026-09-21', disposition: 'Converted' },
];

/* ==================== FOLLOW-UPS ==================== */
export const FOLLOW_UPS = [
  { id: 'F-001', projectId: 'matrimony', leadId: 1, leadName: 'Venu Gopal', mobile: '9876543210', agent: 'Agent1', date: '2026-09-22', time: '11:00 AM', status: 'Today' },
  { id: 'F-002', projectId: 'matrimony', leadId: 2, leadName: 'Kavitha M', mobile: '9876543211', agent: 'Agent1', date: '2026-09-24', time: '02:00 PM', status: 'Upcoming' },
  { id: 'F-003', projectId: 'matrimony', leadId: 3, leadName: 'Ramesh K', mobile: '9876543212', agent: 'Agent2', date: '2026-09-20', time: '10:00 AM', status: 'Overdue' },
  { id: 'F-004', projectId: 'property', leadId: 4, leadName: 'Priya S', mobile: '9876543213', agent: 'Agent3', date: '2026-09-22', time: '04:00 PM', status: 'Today' },
];

/* ==================== CAMPAIGNS ==================== */
export const CAMPAIGNS = [
  { id: 'CMP-001', name: 'Q3 Matrimony Outreach', projectId: 'matrimony', leads: 500, calls: 320, connected: 240, interested: 68, converted: 22, status: 'Active', startDate: '2026-09-01', endDate: '2026-09-30' },
  { id: 'CMP-002', name: 'Property Lead Boost', projectId: 'property', leads: 800, calls: 450, connected: 320, interested: 95, converted: 34, status: 'Active', startDate: '2026-09-10', endDate: '2026-10-10' },
  { id: 'CMP-003', name: 'Insurance Renewals', projectId: 'insurance', leads: 200, calls: 180, connected: 140, interested: 42, converted: 18, status: 'Completed', startDate: '2026-08-01', endDate: '2026-08-31' },
];

/* ==================== COMMUNICATION LOGS ==================== */
export const COMMUNICATIONS = [
  { id: 'MSG-001', projectId: 'matrimony', channel: 'SMS', to: '9876543210', message: 'Your appointment is confirmed', status: 'Delivered', date: '2026-09-22 10:15 AM' },
  { id: 'MSG-002', projectId: 'matrimony', channel: 'WhatsApp', to: '9876543211', message: 'Thanks for your enquiry', status: 'Read', date: '2026-09-22 09:40 AM' },
  { id: 'MSG-003', projectId: 'property', channel: 'Email', to: 'priya@example.com', message: 'Property brochure attached', status: 'Sent', date: '2026-09-21 05:20 PM' },
  { id: 'MSG-004', projectId: 'matrimony', channel: 'SMS', to: '9876543212', message: 'Missed call from Eliteinova', status: 'Failed', date: '2026-09-21 03:10 PM' },
];

/* ==================== CREDITS ==================== */
export const CREDITS = [
  { projectId: 'matrimony', balance: 8500, used: 1500, limit: 10000 },
  { projectId: 'property', balance: 3200, used: 1800, limit: 5000 },
  { projectId: 'insurance', balance: 750, used: 250, limit: 1000 },
];

export const CREDIT_TRANSACTIONS = [
  { id: 'TXN-001', projectId: 'matrimony', type: 'topup', amount: 5000, service: 'Credit Purchase', date: '2026-09-01' },
  { id: 'TXN-002', projectId: 'matrimony', type: 'usage', amount: -450, service: 'SMS', date: '2026-09-15' },
  { id: 'TXN-003', projectId: 'matrimony', type: 'usage', amount: -320, service: 'Voice Calls', date: '2026-09-18' },
  { id: 'TXN-004', projectId: 'property', type: 'topup', amount: 3000, service: 'Credit Purchase', date: '2026-09-05' },
];

/* ==================== DEPARTMENTS ==================== */
export const DEPARTMENTS = [
  { id: 'dept-sales', name: 'Sales', description: 'Sales inquiries and new leads' },
  { id: 'dept-support', name: 'Support', description: 'Customer support and queries' },
  { id: 'dept-billing', name: 'Billing', description: 'Billing and payment related' },
  { id: 'dept-accounts', name: 'Accounts', description: 'Accounts and finance' },
];

/* ==================== IVR CONFIG ==================== */
export const IVR_CONFIGS = [
  { projectId: 'matrimony', ivrNumber: '9940493726', welcomeMessage: 'Welcome to Matrimony CRM', menuOptions: ['Sales', 'Support', 'Accounts'], businessHours: '09:00 – 19:00', recording: true, voicemail: true },
  { projectId: 'property', ivrNumber: '9840112233', welcomeMessage: 'Welcome to Property CRM', menuOptions: ['Sales', 'Site Visit', 'Support'], businessHours: '09:00 – 18:00', recording: true, voicemail: false },
  { projectId: 'insurance', ivrNumber: '9677001122', welcomeMessage: 'Welcome to Insurance CRM', menuOptions: ['Sales', 'Renewals', 'Claims'], businessHours: '09:00 – 18:00', recording: false, voicemail: true },
];
/* ==================== INTEGRATIONS ==================== */
export const INTEGRATIONS = [
  { id: 'INT-001', name: 'Exotel Telephony', category: 'Telephony', status: 'Connected', apiKey: 'exo_live_****1234' },
  { id: 'INT-002', name: 'Twilio SMS', category: 'SMS', status: 'Connected', apiKey: 'twl_****5678' },
  { id: 'INT-003', name: 'WhatsApp Business API', category: 'WhatsApp', status: 'Connected', apiKey: 'wa_****9012' },
  { id: 'INT-004', name: 'SendGrid Email', category: 'Email', status: 'Disconnected', apiKey: '' },
  { id: 'INT-005', name: 'Razorpay', category: 'Payment', status: 'Connected', apiKey: 'rzp_****3456' },
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