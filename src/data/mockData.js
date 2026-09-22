// Mock data layer — swap these for real API calls when a backend is connected.

export const WEBSITES = [
  {
    id: 'eliteinova',
    name: 'Eliteinova Global',
    ivrNumber: '9876543210',
    expiresOn: '30 Nov 2026',
    plan: 'Business',
    status: 'Active',
  },
  {
    id: 'orbitmart',
    name: 'OrbitMart Retail',
    ivrNumber: '9840112233',
    expiresOn: '14 Jan 2027',
    plan: 'Growth',
    status: 'Active',
  },
  {
    id: 'zenfin',
    name: 'ZenFin Advisory',
    ivrNumber: '9677001122',
    expiresOn: '02 Mar 2026',
    plan: 'Starter',
    status: 'Trial',
  },
];
//users

export const USERS = [
  { id: 'sa-1', username: '900001', password: 'super@123', role: 'superadmin', name: 'Eliteinova', websiteId: null, avatar: 'AI' },
  { id: 'admin-1', username: '620472', password: 'admin@123', role: 'admin', name: 'Admin1', websiteId: 'eliteinova', avatar: 'SP' },
  { id: 'agent-1', username: '69793@123', password: 'agent@123', role: 'agent', name: 'Agent1', websiteId: 'eliteinova', avatar: 'VG' },
];

export const AGENTS = [
  { id: 1, name: 'Agent1', phone: '9876543210', status: 'Active', leadsAssigned: 1, callsToday: 0, websiteId: 'eliteinova' },
  { id: 2, name: 'Agent2', phone: '9876543210', status: 'Active', leadsAssigned: 4, callsToday: 6, websiteId: 'eliteinova' },
  { id: 3, name: 'Agent3', phone: '9876543210', status: 'Break', leadsAssigned: 2, callsToday: 3, websiteId: 'orbitmart' },
];

export const LEADS = [
  { id: 1, sNo: 1, leadSource: 'IVR', category: 'IVR Inbound', name: 'Venu Gopal Subramani', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'agent1', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'eliteinova', notes: [] },
  { id: 2, sNo: 2, leadSource: 'Website', category: 'Landing Page', name: 'Kavitha Muthu', mobile: '9876543210', account: 'Eliteinova Sep form-copy', assignedAgent: 'Venu Gopal Subramani', followUpDate: '12 Sep 2026', status: 'Follow Up', websiteId: 'eliteinova', notes: [] },
  { id: 3, sNo: 3, leadSource: 'IVR', category: 'IVR Missed', name: 'Ramesh Kannan', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'Venu Gopal Subramani', followUpDate: '—', status: 'Missed', websiteId: 'eliteinova', notes: [] },
  { id: 4, sNo: 1, leadSource: 'WhatsApp', category: 'Campaign', name: 'Priya Sundaram', mobile: '9876543210', account: 'OrbitMart Q3 campaign', assignedAgent: 'Divya Ramesh', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'orbitmart', notes: [] },
  { id: 5, sNo: 4, leadSource: 'IVR', category: 'IVR Inbound', name: 'Venu Gopal Subramani', mobile: '9876543210', account: 'Eliteinova Aug form-copy', assignedAgent: 'Agent1', followUpDate: 'Set Follow-up', status: 'Fresh', websiteId: 'eliteinova', notes: [] },
];

export const DAILY_CALL_TREND = [
  { day: 'Sep 04', calls: 3 },
  { day: 'Sep 05', calls: 5 },
  { day: 'Sep 06', calls: 2 },
  { day: 'Sep 07', calls: 6 },
  { day: 'Sep 08', calls: 4 },
  { day: 'Sep 09', calls: 0 },
  { day: 'Sep 10', calls: 1 },
];

export function statsForWebsite(websiteId) {
  const leads = LEADS.filter((l) => l.websiteId === websiteId);
  const agents = AGENTS.filter((a) => a.websiteId === websiteId);
  return {
    totalLeads: leads.length,
    totalCalls: 0,
    missedCalls: leads.filter((l) => l.status === 'Missed').length,
    activeAgents: agents.filter((a) => a.status === 'Active').length,
    fresh: leads.filter((l) => l.status === 'Fresh').length,
    followUp: leads.filter((l) => l.status === 'Follow Up').length,
    missed: leads.filter((l) => l.status === 'Missed').length,
  };
}