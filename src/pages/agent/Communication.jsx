// src/pages/agent/Communication.jsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Mail, Phone, Send, X, Search, ChevronDown, ChevronRight,
  StickyNote, ListFilter, Inbox, User, Tag, History, Plus, Zap,
  AlertCircle, CheckCircle2, Clock, Calendar, MessageCircle, PhoneIncoming,
  PhoneOutgoing, PhoneMissed, FileText, Paperclip, Smile, Filter, Mic,
  Image as ImageIcon, Link2, MoreHorizontal, Reply, Forward, Trash2,
  Archive, Star, Eye, Download, Volume2, Copy, Users as UsersIcon,
  ShieldCheck, Sparkles, AlertTriangle, Layers, Timer, Play, Pause,
  Repeat, XCircle, RefreshCw, Send as SendIcon, BookOpen, Flame,
  CheckSquare, Square, ChevronUp, ArrowUpRight, ArrowDownRight,
  Clock4, Zap as ZapIcon, Tag as TagIcon, Target, Bookmark,
  Building2, MapPin, IndianRupee, ExternalLink, Bell, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS } from '../../data/mockData';

/* ================================================================
   CONSTANTS
   ================================================================ */
const TABS = [
  { key: 'inbox',       label: 'Unified Inbox',         icon: Inbox },
  { key: 'sms',         label: 'SMS',                   icon: MessageSquare },
  { key: 'whatsapp',    label: 'WhatsApp',              icon: MessageCircle },
  { key: 'email',       label: 'Email',                 icon: Mail },
  { key: 'history',     label: 'Communication History', icon: History },
];

const CHANNELS = [
  { key: 'sms',      label: 'SMS',      icon: MessageSquare, tone: 'purple',
    bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-brand-purple' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, tone: 'emerald',
    bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
  { key: 'email',    label: 'Email',    icon: Mail,          tone: 'amber',
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  { key: 'call',     label: 'Call',     icon: Phone,         tone: 'rose',
    bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-brand-magenta' },
  { key: 'note',     label: 'Note',     icon: StickyNote,    tone: 'amber',
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
];

const STATUS_STYLES = {
  delivered: 'bg-emerald-100 text-emerald-600',
  sent:      'bg-emerald-100 text-emerald-600',
  read:      'bg-blue-100 text-blue-600',
  pending:   'bg-amber-100 text-amber-700',
  failed:    'bg-rose-100 text-rose-500',
  received:  'bg-violet-100 text-brand-purple',
};

const CONVERSATION_STATES = {
  needs_reply: { label: 'Needs Reply', tone: 'rose',    dot: 'bg-rose-500' },
  waiting:     { label: 'Waiting',     tone: 'amber',   dot: 'bg-amber-500' },
  followup:    { label: 'Follow-Up',   tone: 'purple',  dot: 'bg-brand-purple' },
  resolved:    { label: 'Resolved',    tone: 'emerald', dot: 'bg-emerald-500' },
  closed:      { label: 'Closed',      tone: 'slate',   dot: 'bg-slate-400' },
};

const PRIORITY_PILL_STYLES = {
  High:   'bg-rose-100 text-rose-600',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-emerald-100 text-emerald-700',
};

const QUICK_FILTERS = [
  { key: 'all',       label: 'All',           icon: ListFilter,   tone: 'purple' },
  { key: 'needs',     label: 'Needs Reply',   icon: AlertCircle,  tone: 'rose' },
  { key: 'unread',    label: 'Unread',        icon: Inbox,        tone: 'rose' },
  { key: 'today',     label: 'Today',         icon: Calendar,     tone: 'purple' },
  { key: 'waiting',   label: 'Waiting',       icon: Clock,        tone: 'amber' },
  { key: 'failed',    label: 'Failed',        icon: XCircle,      tone: 'slate' },
  { key: 'followup',  label: 'Follow-Up',     icon: Calendar,     tone: 'amber' },
];

const TEMPLATE_LIBRARY = {
  sales: {
    label: 'Sales',
    templates: [
      { id: 'ts-1', label: 'Initial Enquiry',   body: 'Hi {{customer_name}}, thank you for your interest in {{project_name}}. When would be a good time to discuss?' },
      { id: 'ts-2', label: 'Follow-Up',         body: 'Hi {{customer_name}}, following up on our previous conversation about {{property_type}}. Let me know if you have any questions.' },
      { id: 'ts-3', label: 'Price Details',     body: 'Hi {{customer_name}}, here are the price details for the {{property_type}} you enquired about. Let me know if it fits your budget.' },
      { id: 'ts-4', label: 'Brochure',          body: 'Hi {{customer_name}}, I have attached the brochure for {{project_name}}. Please take a look and let me know your thoughts.' },
      { id: 'ts-5', label: 'Site Visit',        body: 'Hi {{customer_name}}, shall we schedule a site visit for {{project_name}}? I can arrange a slot this week.' },
    ],
  },
  appointment: {
    label: 'Appointment',
    templates: [
      { id: 'ta-1', label: 'Confirmation',      body: 'Hi {{customer_name}}, your appointment for {{project_name}} is confirmed for {{appointment_date}}. See you then!' },
      { id: 'ta-2', label: 'Reminder',          body: 'Hi {{customer_name}}, this is a friendly reminder about your appointment tomorrow. Looking forward to meeting you.' },
      { id: 'ta-3', label: 'Reschedule',        body: 'Hi {{customer_name}}, unfortunately we need to reschedule our appointment. Would another time work for you?' },
    ],
  },
  service: {
    label: 'Customer Service',
    templates: [
      { id: 'tsv-1', label: 'Thank You',        body: 'Hi {{customer_name}}, thank you for your time today. Let me know if there is anything else I can help with.' },
      { id: 'tsv-2', label: 'Info Request',     body: 'Hi {{customer_name}}, could you please share the requested details so we can proceed further?' },
      { id: 'tsv-3', label: 'Document Request', body: 'Hi {{customer_name}}, we need the following document to proceed: {{document_name}}.' },
    ],
  },
};

const SNOOZE_PRESETS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour',     value: 60 },
  { label: 'Later today', value: 180 },
  { label: 'Tomorrow',   value: 24 * 60 },
  { label: 'Next week',  value: 7 * 24 * 60 },
];

const DEFAULT_PERMISSIONS = {
  call: true, sms: true, whatsapp: true, email: true, note: true, followUp: true,
};

const REPLY_WINDOW_MIN = 15;
const REPLY_WINDOW_WARN_MIN = 10;

/* ================================================================
   HELPERS
   ================================================================ */
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayYMD = () => ymd(new Date());

const timeAgo = (iso) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${min % 60}m ago`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h ago`;
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && ymd(d) === todayYMD();
};

const getSLAState = (message) => {
  if (message.direction !== 'incoming') return { state: 'n/a', minutes: 0, label: '' };
  const minutes = Math.floor((Date.now() - new Date(message.at).getTime()) / 60000);
  const target = message.priority === 'High' ? REPLY_WINDOW_MIN : 30;
  const remaining = target - minutes;

  if (message.unread === false) return { state: 'met', minutes, target, remaining, label: 'Replied' };
  if (remaining <= 0)              return { state: 'breached', minutes, target, remaining, label: `${Math.abs(remaining)}m overdue` };
  if (remaining <= 5)              return { state: 'warning',  minutes, target, remaining, label: `${remaining}m left` };
  return                                  { state: 'on-track', minutes, target, remaining, label: `${remaining}m left` };
};

function getNextAction(conv) {
  const last = conv.lastMessage;

  if (last.status === 'failed') {
    return {
      label: 'Retry Send', tone: 'rose', icon: RefreshCw,
      reason: `Previous ${last.channel.toUpperCase()} failed to deliver.`,
      primary: 'Retry',
    };
  }
  if (last.direction === 'incoming') {
    if (/brochure/i.test(last.body)) {
      return {
        label: 'Send Brochure', tone: 'emerald', icon: FileText,
        reason: `${conv.customer.split(' ')[0]} asked for the brochure ${timeAgo(last.at)}.`,
        primary: 'Send Brochure',
      };
    }
    if (/price|pricing|cost/i.test(last.body)) {
      return {
        label: 'Send Price Details', tone: 'amber', icon: Tag,
        reason: `Customer is asking about pricing.`,
        primary: 'Send Price',
      };
    }
    if (/callback|call me|call back/i.test(last.body)) {
      return {
        label: 'Call Back', tone: 'rose', icon: PhoneCall,
        reason: `Customer requested a callback.`,
        primary: 'Call Now',
      };
    }
    if (/confirm|receipt/i.test(last.body)) {
      return {
        label: 'Confirm Receipt', tone: 'emerald', icon: CheckCircle2,
        reason: `Customer is waiting for confirmation.`,
        primary: 'Confirm',
      };
    }
    return {
      label: 'Reply', tone: 'rose', icon: Reply,
      reason: `Customer is waiting for a response.`,
      primary: 'Reply',
    };
  }
  if (conv.state === 'followup') {
    return {
      label: 'Follow-Up Due', tone: 'amber', icon: Calendar,
      reason: conv.nextFollowUp ? `Scheduled for ${conv.nextFollowUp}.` : 'Follow-up is due.',
      primary: 'Follow Up',
    };
  }
  return {
    label: 'Waiting for Reply', tone: 'purple', icon: Clock,
    reason: `Last contact was ${timeAgo(last.at)}.`,
    primary: '—',
  };
}

function computeState(messages) {
  const last = messages[0];
  const hasUnreadIncoming = messages.some((m) => m.unread && m.direction === 'incoming');

  if (last.status === 'failed') return 'waiting';
  if (hasUnreadIncoming) return 'needs_reply';
  if (messages.some((m) => m.followUp)) return 'followup';
  if (last.direction === 'outgoing') return 'waiting';
  return 'resolved';
}

function computeConversationSLA(messages) {
  const unreadIncoming = messages
    .filter((m) => m.direction === 'incoming' && m.unread)
    .sort((a, b) => new Date(a.at) - new Date(b.at));

  if (unreadIncoming.length === 0) return null;
  return getSLAState(unreadIncoming[0]);
}

function groupConversations(messages) {
  const byCustomer = new Map();
  for (const m of messages) {
    const key = m.customer;
    if (!byCustomer.has(key)) byCustomer.set(key, []);
    byCustomer.get(key).push(m);
  }
  const list = [];
  for (const [customer, msgs] of byCustomer.entries()) {
    const sorted = [...msgs].sort((a, b) => new Date(b.at) - new Date(a.at));
    list.push({
      customer,
      mobile: sorted[0].mobile,
      email: sorted[0].email,
      leadId: sorted.find((m) => m.leadId)?.leadId || '—',
      messages: sorted,
      lastMessage: sorted[0],
      unread: sorted.filter((m) => m.unread).length,
      state: computeState(sorted),
      sla: computeConversationSLA(sorted),
      priority: sorted.find((m) => m.priority)?.priority || 'Medium',
      leadStage: sorted.find((m) => m.leadStage)?.leadStage || 'Warm',
      campaign: sorted.find((m) => m.campaign)?.campaign || 'Q3 Outreach',
      source: sorted.find((m) => m.source)?.source || 'Website',
      budget: sorted.find((m) => m.budget)?.budget || '—',
      location: sorted.find((m) => m.location)?.location || '—',
      lastOutcome: sorted.find((m) => m.lastOutcome)?.lastOutcome || '—',
      preferredContact: sorted.find((m) => m.preferredContact)?.preferredContact || '—',
      tags: [...new Set(sorted.flatMap((m) => m.tags || []))],
      nextFollowUp: sorted.find((m) => m.followUp)?.followUp || null,
    });
  }
  return list.sort((a, b) => new Date(b.lastMessage.at) - new Date(a.lastMessage.at));
}

function renderTemplate(body, vars) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

/* ================================================================
   DEMO DATA
   ================================================================ */
const buildDemoMessages = (agentName, websiteId) => {
  const now = Date.now();
  const minsAgo = (m) => new Date(now - m * 60000).toISOString();

  return [
    {
      id: 'm-1', agentName, projectId: websiteId, channel: 'whatsapp',
      customer: 'Rahul Kumar', mobile: '9876543210', email: 'rahul@example.com',
      direction: 'incoming', status: 'read',
      body: 'Hi, I saw your 2BHK listing. Can you send me the brochure?',
      at: minsAgo(8), unread: true,
      priority: 'High', leadStage: 'Hot', campaign: 'Q3 Outreach', source: 'Facebook Campaign',
      tags: ['Hot Lead', 'Brochure Request'],
      followUp: 'Today · 6:00 PM',
      leadId: 'LD-1024', budget: '₹60L', location: 'Bangalore',
      lastOutcome: 'Interested', preferredContact: 'After 6 PM · Weekdays',
    },
    {
      id: 'm-1b', agentName, projectId: websiteId, channel: 'whatsapp',
      customer: 'Rahul Kumar', mobile: '9876543210', email: 'rahul@example.com',
      direction: 'outgoing', status: 'delivered',
      body: 'Sure Rahul, I will send the brochure right away.',
      at: minsAgo(20), priority: 'High',
    },
    {
      id: 'm-1c', agentName, projectId: websiteId, channel: 'call',
      customer: 'Rahul Kumar', mobile: '9876543210', email: '',
      direction: 'outgoing', status: 'delivered',
      body: 'Outbound call · Connected 4:32 · Interested',
      at: minsAgo(320), priority: 'High',
    },
    {
      id: 'm-1d', agentName, projectId: websiteId, channel: 'note',
      customer: 'Rahul Kumar', mobile: '9876543210', email: '',
      direction: 'internal', status: 'sent',
      body: 'Customer is relocating for work. Prefers weekend calls after 6 PM.',
      at: minsAgo(400),
    },
    {
      id: 'm-2', agentName, projectId: websiteId, channel: 'sms',
      customer: 'Priya Sharma', mobile: '9876543211', email: '',
      direction: 'outgoing', status: 'delivered',
      body: 'Hi Priya, following up on the pricing discussion. Please let me know a good time to call.',
      at: minsAgo(24), priority: 'Medium',
      tags: ['Price Concern'],
      leadId: 'LD-1025', leadStage: 'Warm', campaign: 'Q4 Push', source: 'Instagram',
      budget: '₹45L', location: 'Mumbai', lastOutcome: 'Contacted',
    },
    {
      id: 'm-3', agentName, projectId: websiteId, channel: 'email',
      customer: 'Arun Mehta', mobile: '9876543212', email: 'arun.mehta@example.com',
      direction: 'incoming', status: 'received',
      body: 'Sharing the GST certificate you requested. Please confirm receipt.',
      attachments: [{ name: 'GST_Certificate.pdf', size: '240 KB' }],
      at: minsAgo(52), unread: true,
      priority: 'High',
      tags: ['Document'],
      leadId: 'LD-1026', leadStage: 'Warm', campaign: 'Referral', source: 'Referral',
      budget: '₹30L', location: 'Pune', lastOutcome: 'Requested document',
    },
    {
      id: 'm-4', agentName, projectId: websiteId, channel: 'whatsapp',
      customer: 'Meena Raj', mobile: '9876543213', email: '',
      direction: 'outgoing', status: 'delivered',
      body: '🎉 Great news! Your booking slot is confirmed for Saturday 11 AM.',
      at: minsAgo(90), priority: 'Low',
      tags: ['Booking Confirmed'],
      leadId: 'LD-1027', leadStage: 'Hot', campaign: 'Referral', source: 'Referral',
    },
    {
      id: 'm-5', agentName, projectId: websiteId, channel: 'sms',
      customer: 'Suresh Iyer', mobile: '9876543214', email: '',
      direction: 'outgoing', status: 'failed',
      body: 'Reminder: Your site visit is scheduled tomorrow at 4 PM.',
      at: minsAgo(150), priority: 'High',
      leadId: 'LD-1028', leadStage: 'Warm', campaign: 'Q3 Outreach', source: 'Google Ads',
    },
    {
      id: 'm-6', agentName, projectId: websiteId, channel: 'email',
      customer: 'Divya Nair', mobile: '9876543215', email: 'divya@example.com',
      direction: 'outgoing', status: 'sent',
      body: 'Hi Divya, attached is the updated price sheet for your preferred unit.',
      attachments: [{ name: 'Pricing_Updated.pdf', size: '180 KB' }],
      at: minsAgo(240), priority: 'Medium',
      leadId: 'LD-1029', leadStage: 'Warm', campaign: 'Q4 Push', source: 'Website',
    },
  ];
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Communication() {
  const { user, activeWebsiteId } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [viewMode, setViewMode] = useState('conversations');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    channels: [], directions: [], statuses: [], priorities: [], dateFrom: '', dateTo: '',
  });

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(null);
  const [showQuickAction, setShowQuickAction] = useState(null);
  const [showNote, setShowNote] = useState(null);
  const [showReplyFollowUp, setShowReplyFollowUp] = useState(null);
  const [showRetry, setShowRetry] = useState(null);
  const [showSnooze, setShowSnooze] = useState(null);
  const [toast, setToast] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

  const [messages, setMessages] = useState(() =>
    buildDemoMessages(user?.name || 'Agent', activeWebsiteId)
  );

  useEffect(() => {
    setMessages(buildDemoMessages(user?.name || 'Agent', activeWebsiteId));
  }, [user?.name, activeWebsiteId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ---------- SUMMARY ---------- */
  const summary = useMemo(() => {
    const unread = messages.filter((m) => m.unread).length;
    const sms = messages.filter((m) => m.channel === 'sms').length;
    const whatsapp = messages.filter((m) => m.channel === 'whatsapp').length;
    const email = messages.filter((m) => m.channel === 'email').length;
    const needsReply = messages.filter((m) => m.unread && m.direction === 'incoming').length;
    const failed = messages.filter((m) => m.status === 'failed').length;
    const unreadSms = messages.filter((m) => m.channel === 'sms' && m.unread).length;
    const unreadWa = messages.filter((m) => m.channel === 'whatsapp' && m.unread).length;
    const unreadEmail = messages.filter((m) => m.channel === 'email' && m.unread).length;

    const incomingUnread = messages.filter((m) => m.direction === 'incoming' && m.unread);
    const breached = incomingUnread.filter((m) => getSLAState(m).state === 'breached').length;
    const warning = incomingUnread.filter((m) => getSLAState(m).state === 'warning').length;
    const urgent = messages.filter((m) => m.unread && m.direction === 'incoming' && m.priority === 'High').length;

    return {
      unread, sms, whatsapp, email, total: messages.length,
      needsReply, failed,
      unreadSms, unreadWa, unreadEmail,
      breached, warning, urgent,
    };
  }, [messages, tick]);

  /* ---------- CONVERSATIONS ---------- */
  const allConversations = useMemo(() => groupConversations(messages), [messages]);

  /* ---------- FILTERED MESSAGES ---------- */
  const filteredMessages = useMemo(() => {
    let list = messages;

    if (activeTab === 'sms')      list = list.filter((m) => m.channel === 'sms');
    if (activeTab === 'whatsapp') list = list.filter((m) => m.channel === 'whatsapp');
    if (activeTab === 'email')    list = list.filter((m) => m.channel === 'email');
    if (activeTab === 'inbox')    list = list.filter((m) => m.unread || m.direction === 'incoming');

    if (quickFilter === 'needs')    list = list.filter((m) => m.unread && m.direction === 'incoming');
    if (quickFilter === 'unread')   list = list.filter((m) => m.unread);
    if (quickFilter === 'today')    list = list.filter((m) => isToday(m.at));
    if (quickFilter === 'waiting')  list = list.filter((m) => m.direction === 'outgoing');
    if (quickFilter === 'failed')   list = list.filter((m) => m.status === 'failed');
    if (quickFilter === 'followup') list = list.filter((m) => m.followUp);

    if (advancedFilters.channels.length > 0)
      list = list.filter((m) => advancedFilters.channels.includes(m.channel));
    if (advancedFilters.directions.length > 0)
      list = list.filter((m) => advancedFilters.directions.includes(m.direction));
    if (advancedFilters.statuses.length > 0)
      list = list.filter((m) => advancedFilters.statuses.includes(m.status));
    if (advancedFilters.priorities.length > 0)
      list = list.filter((m) => advancedFilters.priorities.includes(m.priority));
    if (advancedFilters.dateFrom) {
      const from = new Date(advancedFilters.dateFrom).getTime();
      list = list.filter((m) => new Date(m.at).getTime() >= from);
    }
    if (advancedFilters.dateTo) {
      const to = new Date(advancedFilters.dateTo).getTime() + 86400000;
      list = list.filter((m) => new Date(m.at).getTime() <= to);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) =>
        `${m.customer} ${m.mobile} ${m.email || ''} ${m.body || ''} ${m.leadId || ''} ${m.campaign || ''}`.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [messages, activeTab, searchQuery, quickFilter, advancedFilters]);

  const filteredConversations = useMemo(() => {
    const customerSet = new Set(filteredMessages.map((m) => m.customer));
    return allConversations.filter((c) => customerSet.has(c.customer));
  }, [allConversations, filteredMessages]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.channels.length)   count += advancedFilters.channels.length;
    if (advancedFilters.directions.length) count += advancedFilters.directions.length;
    if (advancedFilters.statuses.length)   count += advancedFilters.statuses.length;
    if (advancedFilters.priorities.length) count += advancedFilters.priorities.length;
    if (advancedFilters.dateFrom || advancedFilters.dateTo) count += 1;
    return count;
  }, [advancedFilters]);

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      channels: [], directions: [], statuses: [], priorities: [], dateFrom: '', dateTo: '',
    });
  };

  /* ---------- HANDLERS ---------- */
  const handleSend = (payload) => {
    const entry = {
      id: `m-${Date.now()}`,
      agentName: user?.name || 'Agent',
      projectId: activeWebsiteId,
      channel: payload.channel,
      customer: payload.customer,
      mobile: payload.mobile,
      email: payload.email,
      direction: 'outgoing',
      status: payload.channel === 'email' ? 'sent' : 'delivered',
      body: payload.body,
      attachments: payload.attachments || [],
      at: new Date().toISOString(),
      priority: payload.priority || 'Medium',
      followUp: payload.followUp || null,
      leadId: payload.leadId,
    };
    setMessages((prev) => [entry, ...prev]);
    setShowCompose(null);
    setShowReplyFollowUp(null);
    setShowRetry(null);

    showToast(
      `${channelLabel(payload.channel)} sent to ${payload.customer}` +
      (payload.followUp ? ` · follow-up scheduled` : '')
    );
  };

  const handleRetry = (msg, newChannel) => {
    const entry = {
      id: `m-${Date.now()}`,
      agentName: user?.name || 'Agent',
      projectId: activeWebsiteId,
      channel: newChannel || msg.channel,
      customer: msg.customer,
      mobile: msg.mobile,
      email: msg.email,
      direction: 'outgoing',
      status: newChannel === 'email' ? 'sent' : 'delivered',
      body: msg.body,
      at: new Date().toISOString(),
      priority: msg.priority,
      leadId: msg.leadId,
    };
    setMessages((prev) => [entry, ...prev]);
    setShowRetry(null);
    showToast(`Retried via ${channelLabel(newChannel || msg.channel)}`);
  };

  const handleMarkRead = (msg) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m))
    );
  };

  const handleNoteSave = (msg, note) => {
    const entry = {
      id: `m-${Date.now()}`,
      agentName: user?.name || 'Agent',
      projectId: activeWebsiteId,
      channel: 'note',
      customer: msg.customer,
      mobile: msg.mobile,
      email: msg.email,
      direction: 'internal',
      status: 'sent',
      body: note,
      at: new Date().toISOString(),
    };
    setMessages((prev) => [entry, ...prev]);
    setShowNote(null);
    showToast('Note saved');
  };

  const handlePickChannel = (channel, target) => {
    if (channel === 'call') {
      const dialLead = target
        ? {
            customer: target.customer,
            mobile: target.mobile,
            leadSource: 'Communication',
            source: target.channel,
          }
        : undefined;
      navigate('/agent/calls', dialLead ? { state: { dialLead } } : undefined);
      return;
    }

    if (channel === 'note') {
      if (target) setShowNote(target);
      return;
    }

    if (channel === 'followUp') {
      if (target) setShowReplyFollowUp(target);
      return;
    }

    setShowCompose({
      channel,
      preset: target
        ? { customer: target.customer, mobile: target.mobile, email: target.email }
        : undefined,
    });
  };

  const updateConversationState = (customer, state) => {
    setMessages((prev) =>
      prev.map((m) => (m.customer === customer ? { ...m, forceState: state } : m))
    );
    showToast(`Conversation marked as ${CONVERSATION_STATES[state].label}`);
  };

  const handleSnooze = (msg, minutes) => {
    const due = new Date(Date.now() + minutes * 60000);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? { ...m, followUp: `${ymd(due)} · ${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}` }
          : m
      )
    );
    setShowSnooze(null);
    showToast(`Snoozed ${minutes} min`);
  };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-24">
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Communication</h1>
            <p className="text-sm text-brand-ink/50">
              Understand the customer and complete the next communication action.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full border border-brand-lilac bg-white p-1 sm:flex">
              <button
                onClick={() => setViewMode('conversations')}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  viewMode === 'conversations'
                    ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white'
                    : 'text-brand-ink/60 hover:text-brand-magenta'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setViewMode('messages')}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  viewMode === 'messages'
                    ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white'
                    : 'text-brand-ink/60 hover:text-brand-magenta'
                }`}
              >
                Messages
              </button>
            </div>

            <button
              onClick={() => setShowCompose({ channel: 'sms' })}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              <Plus size={14} /> New Message
            </button>
          </div>
        </div>

        {/* ================= KPI STRIP (MOVED TO TOP) ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard label="Unread"     value={summary.unread}    sub="Needs attention" icon={Inbox}          color="rose"    delay={0} />
          <AnimatedStatCard label="WhatsApp"   value={summary.whatsapp}  sub="Messages"        icon={MessageCircle}  color="emerald" delay={40} />
          <AnimatedStatCard label="SMS"        value={summary.sms}       sub="Messages"        icon={MessageSquare}  color="purple"  delay={80} />
          <AnimatedStatCard label="Email"      value={summary.email}     sub="Messages"        icon={Mail}           color="amber"   delay={120} />
          <AnimatedStatCard label="Failed"     value={summary.failed}    sub="Retry needed"    icon={XCircle}        color="rose"    delay={160} />
        </div>

        {/* ================= HERO ================= */}
        <CommunicationHero
          permissions={DEFAULT_PERMISSIONS}
          onPickChannel={(channel) => handlePickChannel(channel)}
          unread={summary.unread}
        />

        {/* ================= SMARTER NEEDS ATTENTION ================= */}
        <NeedsAttention
          urgent={summary.urgent}
          breached={summary.breached}
          warning={summary.warning}
          needsReply={summary.needsReply}
          failed={summary.failed}
          unread={summary.unread}
          onPick={(key) => {
            if (key === 'urgent')     { setQuickFilter('needs'); setActiveTab('inbox'); }
            if (key === 'breached')   { setQuickFilter('needs'); setActiveTab('inbox'); }
            if (key === 'warning')    { setQuickFilter('needs'); setActiveTab('inbox'); }
            if (key === 'needs')      { setQuickFilter('needs'); setActiveTab('inbox'); }
            if (key === 'failed')     { setQuickFilter('failed'); setActiveTab('inbox'); }
            if (key === 'unread')     { setQuickFilter('unread'); setActiveTab('inbox'); }
          }}
        />

        {/* ================= TABS ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count =
                t.key === 'inbox'    ? summary.needsReply :
                t.key === 'sms'      ? summary.sms :
                t.key === 'whatsapp' ? summary.whatsapp :
                t.key === 'email'    ? summary.email :
                summary.total;
              const hasUnread =
                (t.key === 'sms' && summary.unreadSms > 0) ||
                (t.key === 'whatsapp' && summary.unreadWa > 0) ||
                (t.key === 'email' && summary.unreadEmail > 0) ||
                (t.key === 'inbox' && summary.needsReply > 0);
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {t.label}
                  {hasUnread && !active && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                    </span>
                  )}
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= QUICK FILTERS ================= */}
        <QuickFilters activeKey={quickFilter} onPick={setQuickFilter} />

        {/* ================= SEARCH + FILTERS ================= */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, mobile, email, lead ID, campaign…"
              className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac"
              >
                <X size={14} className="text-brand-ink/50" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilters((s) => !s)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm font-semibold transition-all ${
              activeFilterCount > 0
                ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                : 'border-brand-lilac bg-white text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta'
            }`}
          >
            <Filter size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-magenta px-1.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
            <ListFilter size={14} className="text-brand-magenta" />
            {viewMode === 'conversations' ? 'Conversations:' : 'Messages:'}
            <span className="text-brand-magenta">
              {viewMode === 'conversations' ? filteredConversations.length : filteredMessages.length}
            </span>
          </span>
        </div>

        {/* ================= ADVANCED FILTERS ================= */}
        {showAdvancedFilters && (
          <AdvancedFiltersPanel
            filters={advancedFilters}
            setFilters={setAdvancedFilters}
            onReset={resetAdvancedFilters}
          />
        )}

        {/* ================= RESULTS ================= */}
        {viewMode === 'conversations' ? (
          filteredConversations.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <ConversationRow
                  key={conv.customer}
                  conversation={conv}
                  onView={() => setSelectedConversation(conv)}
                  onQuickAction={(m) => setShowQuickAction(m)}
                  onReplyFU={() => setShowReplyFollowUp(conv.lastMessage)}
                  onSnooze={() => setShowSnooze(conv.lastMessage)}
                />
              ))}
            </div>
          )
        ) : filteredMessages.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((m) => (
              <MessageRow
                key={m.id}
                message={m}
                onView={() => { setSelectedMessage(m); handleMarkRead(m); }}
                onQuickAction={() => setShowQuickAction(m)}
                onRetry={() => setShowRetry(m)}
              />
            ))}
          </div>
        )}

        {/* ================= DRAWERS / MODALS ================= */}
        {selectedConversation && (
          <ConversationDrawer
            conversation={selectedConversation}
            permissions={DEFAULT_PERMISSIONS}
            onClose={() => setSelectedConversation(null)}
            onMarkRead={(m) => handleMarkRead(m)}
            onPickChannel={(channel, target) => {
              handlePickChannel(channel, target || selectedConversation.lastMessage);
              setSelectedConversation(null);
            }}
            onUpdateState={(state) => {
              updateConversationState(selectedConversation.customer, state);
              setSelectedConversation(null);
            }}
            onReplyFU={() => { setShowReplyFollowUp(selectedConversation.lastMessage); setSelectedConversation(null); }}
            onSnooze={() => { setShowSnooze(selectedConversation.lastMessage); setSelectedConversation(null); }}
          />
        )}

        {selectedMessage && (
          <MessageDrawer
            message={selectedMessage}
            permissions={DEFAULT_PERMISSIONS}
            onClose={() => setSelectedMessage(null)}
            onPickChannel={(channel) => {
              handlePickChannel(channel, selectedMessage);
              setSelectedMessage(null);
            }}
            onRetry={() => { setShowRetry(selectedMessage); setSelectedMessage(null); }}
          />
        )}

        {showCompose && (
          <ComposeModal
            initialChannel={showCompose.channel}
            preset={showCompose.preset}
            onClose={() => setShowCompose(null)}
            onSend={handleSend}
          />
        )}

        {showReplyFollowUp && (
          <ReplyFollowUpModal
            target={showReplyFollowUp}
            onClose={() => setShowReplyFollowUp(null)}
            onSend={handleSend}
          />
        )}

        {showRetry && (
          <RetryModal
            message={showRetry}
            onClose={() => setShowRetry(null)}
            onRetry={handleRetry}
            onPickChannel={(channel) => {
              handlePickChannel(channel, showRetry);
              setShowRetry(null);
            }}
          />
        )}

        {showSnooze && (
          <SnoozeModal
            message={showSnooze}
            onClose={() => setShowSnooze(null)}
            onSave={handleSnooze}
          />
        )}

        {showQuickAction && (
          <QuickActionModal
            target={showQuickAction}
            permissions={DEFAULT_PERMISSIONS}
            onClose={() => setShowQuickAction(null)}
            onPick={(channel) => {
              handlePickChannel(channel, showQuickAction);
              setShowQuickAction(null);
            }}
          />
        )}

        {showNote && (
          <NoteModal
            message={showNote}
            onClose={() => setShowNote(null)}
            onSave={handleNoteSave}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   HERO
   ================================================================ */
function CommunicationHero({ permissions, onPickChannel, unread }) {
  const allowed = [
    { key: 'call',     label: 'Call',     desc: 'Direct voice call',   icon: Phone,         tone: 'rose' },
    { key: 'whatsapp', label: 'WhatsApp', desc: 'Instant messages',    icon: MessageCircle, tone: 'emerald' },
    { key: 'sms',      label: 'SMS',      desc: 'Text message',        icon: MessageSquare, tone: 'purple' },
    { key: 'email',    label: 'Email',    desc: 'Email with attach',   icon: Mail,          tone: 'amber' },
  ].filter((c) => permissions[c.key]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-r from-white via-white to-brand-lilac/20 shadow-[0_8px_24px_-12px_rgba(227,28,121,0.2)]">
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-magenta/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-purple/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <Zap size={14} />
              <span className="absolute inset-0 -z-10 animate-ping rounded-lg bg-brand-magenta/30" />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
              Reach a Customer
            </p>
            <span className="hidden h-3 w-px bg-brand-lilac sm:block" />
            <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-ink/40 sm:inline">
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {allowed.map((c) => {
              const Icon = c.icon;
              const tones = {
                rose:    { bg: 'bg-rose-50',    text: 'text-brand-magenta', ring: 'ring-rose-200' },
                emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600',   ring: 'ring-emerald-200' },
                purple:  { bg: 'bg-violet-50',  text: 'text-brand-purple',  ring: 'ring-violet-200' },
                amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',     ring: 'ring-amber-200' },
              };
              const t = tones[c.tone];
              return (
                <button
                  key={c.key}
                  onClick={() => onPickChannel(c.key)}
                  className="group/ch flex items-center gap-2.5 rounded-xl border border-brand-lilac bg-white p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-sm"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.bg} ${t.text} ring-1 ${t.ring}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-ink">{c.label}</p>
                    <p className="truncate text-[10px] text-brand-ink/50">{c.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   NEEDS ATTENTION
   ================================================================ */
function NeedsAttention({ urgent, breached, warning, needsReply, failed, unread, onPick }) {
  const items = [
    { key: 'urgent',   label: 'Urgent',         count: urgent,     tone: 'rose',   icon: Flame },
    { key: 'breached', label: 'SLA Breached',   count: breached,   tone: 'rose',   icon: AlertTriangle },
    { key: 'warning',  label: 'Reply Soon',     count: warning,    tone: 'amber',  icon: Timer },
    { key: 'needs',    label: 'Needs Reply',    count: needsReply, tone: 'rose',   icon: AlertCircle },
    { key: 'failed',   label: 'Failed Messages',count: failed,     tone: 'amber',  icon: XCircle },
    { key: 'unread',   label: 'Unread',         count: unread,     tone: 'purple', icon: Inbox },
  ];

  const tones = {
    rose:   { bg: 'bg-rose-50',    text: 'text-rose-600',   ring: 'ring-rose-200' },
    amber:  { bg: 'bg-amber-50',   text: 'text-amber-700',  ring: 'ring-amber-200' },
    purple: { bg: 'bg-violet-50',  text: 'text-brand-purple', ring: 'ring-violet-200' },
  };

  return (
    <div className="card !p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
          <ZapIcon size={12} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
          Needs Attention
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const t = tones[item.tone];
          const isZero = item.count === 0;
          return (
            <button
              key={item.key}
              onClick={() => !isZero && onPick(item.key)}
              disabled={isZero}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                isZero
                  ? 'border-brand-lilac bg-white text-brand-ink/40 cursor-not-allowed'
                  : 'border-brand-lilac bg-white text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-md ring-1 ${t.bg} ${t.text} ${t.ring}`}>
                <Icon size={10} />
              </span>
              {item.label}
              <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                isZero ? 'bg-brand-lilac/50 text-brand-ink/40' : `${t.bg} ${t.text}`
              }`}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   QUICK FILTERS
   ================================================================ */
function QuickFilters({ activeKey, onPick }) {
  const tones = {
    purple: { bg: 'bg-violet-50',  text: 'text-brand-purple',  ring: 'ring-violet-200' },
    rose:   { bg: 'bg-rose-50',    text: 'text-rose-600',      ring: 'ring-rose-200' },
    amber:  { bg: 'bg-amber-50',   text: 'text-amber-700',     ring: 'ring-amber-200' },
    emerald:{ bg: 'bg-emerald-50', text: 'text-emerald-600',   ring: 'ring-emerald-200' },
    slate:  { bg: 'bg-slate-50',   text: 'text-slate-600',     ring: 'ring-slate-200' },
  };

  return (
    <div className="card !p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
          <ListFilter size={12} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
          Quick Filters
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((q) => {
          const Icon = q.icon;
          const active = activeKey === q.key;
          const t = tones[q.tone] || tones.purple;
          return (
            <button
              key={q.key}
              onClick={() => onPick(q.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                active
                  ? 'border-brand-magenta bg-brand-magenta text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
                  : 'border-brand-lilac bg-white text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-md ${
                active ? 'bg-white/25 text-white' : `${t.bg} ${t.text} ring-1 ${t.ring}`
              }`}>
                <Icon size={10} />
              </span>
              {q.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   ADVANCED FILTERS PANEL
   ================================================================ */
function AdvancedFiltersPanel({ filters, setFilters, onReset }) {
  const toggle = (key, value) => {
    setFilters((f) => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  };

  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <Filter size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Advanced Filters
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta"
        >
          <X size={11} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterGroup label="Channel"   options={['sms', 'whatsapp', 'email', 'call', 'note']} selected={filters.channels}   onToggle={(v) => toggle('channels', v)} />
        <FilterGroup label="Direction" options={['incoming', 'outgoing', 'internal']}          selected={filters.directions} onToggle={(v) => toggle('directions', v)} />
        <FilterGroup label="Status"    options={['delivered', 'sent', 'read', 'pending', 'failed', 'received']} selected={filters.statuses} onToggle={(v) => toggle('statuses', v)} />
        <FilterGroup label="Priority"  options={['High', 'Medium', 'Low']}                     selected={filters.priorities} onToggle={(v) => toggle('priorities', v)} />

        <div className="sm:col-span-2">
          <p className="mb-1.5 text-xs font-semibold text-brand-ink/70">Date Range</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-brand-ink/70">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize transition-all ${
                active
                  ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                  : 'border-brand-lilac bg-white text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta'
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   CONVERSATION ROW
   ================================================================ */
function ConversationRow({ conversation, onView, onQuickAction, onReplyFU, onSnooze }) {
  const last = conversation.lastMessage;
  const channel = CHANNELS.find((c) => c.key === last.channel) || CHANNELS[0];
  const Icon = channel.icon;
  const state = CONVERSATION_STATES[conversation.state] || CONVERSATION_STATES.resolved;
  const action = getNextAction(conversation);
  const ActionIcon = action.icon;
  const sla = conversation.sla;

  const nextActionTones = {
    rose:    'bg-rose-50 text-rose-600 ring-rose-200',
    amber:   'bg-amber-50 text-amber-700 ring-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
    purple:  'bg-violet-50 text-brand-purple ring-violet-200',
  };

  const slaTone =
    sla?.state === 'breached' ? 'bg-rose-100 text-rose-600' :
    sla?.state === 'warning'  ? 'bg-amber-100 text-amber-700' :
    sla?.state === 'on-track' ? 'bg-emerald-100 text-emerald-600' :
    sla?.state === 'met'      ? 'bg-emerald-100 text-emerald-600' :
    null;

  return (
    <div
      className={`group relative flex flex-wrap items-center gap-3 rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
        sla?.state === 'breached' ? 'border-rose-300' :
        conversation.unread > 0 ? 'border-brand-magenta/40' :
        'border-brand-lilac/70 hover:border-brand-magenta/40'
      }`}
    >
      <button
        onClick={onView}
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm transition-transform group-hover:scale-110 ${
          conversation.state === 'needs_reply'
            ? 'bg-gradient-to-br from-brand-magenta to-brand-purple'
            : conversation.state === 'waiting'
            ? 'bg-gradient-to-br from-amber-500 to-orange-500'
            : conversation.state === 'followup'
            ? 'bg-gradient-to-br from-brand-purple to-violet-600'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
        }`}
      >
        {conversation.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        {conversation.unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
            {conversation.unread}
          </span>
        )}
      </button>

      <button onClick={onView} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`truncate text-sm font-semibold ${conversation.unread > 0 ? 'text-brand-magenta' : 'text-brand-ink'}`}>
            {conversation.customer}
          </p>

          {conversation.priority && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_PILL_STYLES[conversation.priority]}`}>
              {conversation.priority}
            </span>
          )}

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 text-[9px] font-bold uppercase text-brand-ink/60">
            <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} />
            {state.label}
          </span>

          {slaTone && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${slaTone}`}>
              <Timer size={9} className="inline" /> {sla.label}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${channel.bg} ${channel.text}`}>
            <Icon size={10} />
          </span>
          <p className="truncate text-xs text-brand-ink/60">
            {last.direction === 'outgoing' && <span className="text-brand-ink/40">You: </span>}
            {last.body}
          </p>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-brand-ink/40">
          <span>{timeAgo(last.at)}</span>
          <span>·</span>
          <span>{conversation.messages.length} messages</span>
          {conversation.nextFollowUp && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                <Calendar size={9} /> {conversation.nextFollowUp}
              </span>
            </>
          )}
          {conversation.tags.slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-brand-mist px-2 py-0.5 text-[9px] font-semibold text-brand-ink/60">
              {t}
            </span>
          ))}
        </div>
      </button>

      <span
        title={action.reason}
        className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 sm:inline-flex ${
          nextActionTones[action.tone] || nextActionTones.purple
        }`}
      >
        <ActionIcon size={10} /> {action.label}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
          title="Open conversation"
        >
          <Eye size={13} />
        </button>
        <button
          onClick={onReplyFU}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[11px] font-semibold text-amber-600 transition-all hover:bg-amber-100 sm:flex"
          title="Reply + Follow-Up"
        >
          <Calendar size={12} />
        </button>
        <button
          onClick={onQuickAction}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple px-2.5 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
          title="Reply"
        >
          <Reply size={12} /> Reply
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   MESSAGE ROW (flat view)
   ================================================================ */
function MessageRow({ message, onView, onQuickAction, onRetry }) {
  const channel = CHANNELS.find((c) => c.key === message.channel) || CHANNELS[0];
  const Icon = channel.icon;
  const isIncoming = message.direction === 'incoming';
  const status = message.status || 'sent';
  const isFailed = status === 'failed';
  const isNote = message.channel === 'note';
  const sla = isIncoming && message.unread ? getSLAState(message) : null;

  const slaTone =
    sla?.state === 'breached' ? 'bg-rose-100 text-rose-600' :
    sla?.state === 'warning'  ? 'bg-amber-100 text-amber-700' :
    sla?.state === 'on-track' ? 'bg-emerald-100 text-emerald-600' :
    null;

  return (
    <div
      className={`group relative flex flex-wrap items-center gap-3 rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
        isFailed
          ? 'border-rose-200/70'
          : message.unread
          ? 'border-brand-magenta/40'
          : isNote
          ? 'border-amber-200/70'
          : 'border-brand-lilac/70 hover:border-brand-magenta/40'
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${channel.bg} ${channel.text} ring-1 ${channel.border}`}>
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`truncate text-sm font-semibold ${message.unread ? 'text-brand-magenta' : 'text-brand-ink'}`}>
            {message.customer}
          </p>
          {message.unread && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
          )}
          {isNote && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">
              Internal Note
            </span>
          )}
          {!isNote && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
              isIncoming ? 'bg-violet-100 text-brand-purple' : 'bg-slate-100 text-slate-600'
            }`}>
              {isIncoming ? 'Incoming' : 'Outgoing'}
            </span>
          )}
          {slaTone && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${slaTone}`}>
              <Timer size={9} className="inline" /> {sla.label}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-brand-ink/60">{message.body}</p>
        <p className="mt-0.5 truncate text-[10px] text-brand-ink/40">
          {message.mobile}{message.email ? ` · ${message.email}` : ''} · {timeAgo(message.at)}
        </p>
      </div>

      <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize sm:inline-flex ${STATUS_STYLES[status] || STATUS_STYLES.sent}`}>
        {status}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        {isFailed && (
          <button
            onClick={onRetry}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-rose-500 px-2.5 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
            title="Retry"
          >
            <RefreshCw size={12} /> Retry
          </button>
        )}
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
          title="View"
        >
          <Eye size={13} />
        </button>
        {!isFailed && (
          <button
            onClick={onQuickAction}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple px-2.5 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
          >
            <Reply size={12} /> Reply
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   CONVERSATION DRAWER
   ================================================================ */
function ConversationDrawer({
  conversation, permissions, onClose, onMarkRead, onPickChannel, onUpdateState, onReplyFU, onSnooze,
}) {
  const state = CONVERSATION_STATES[conversation.state] || CONVERSATION_STATES.resolved;
  const action = getNextAction(conversation);
  const ActionIcon = action.icon;
  const sla = conversation.sla;

  const groupedByDay = useMemo(() => {
    const groups = new Map();
    const sorted = [...conversation.messages].sort((a, b) => new Date(b.at) - new Date(a.at));
    for (const m of sorted) {
      const d = new Date(m.at);
      const key = ymd(d);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    }
    return [...groups.entries()];
  }, [conversation.messages]);

  const dayLabel = (key) => {
    if (key === todayYMD()) return 'Today';
    const d = new Date(key);
    const yest = new Date(Date.now() - 86400000);
    if (ymd(yest) === key) return 'Yesterday';
    return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  const actions = [
    { key: 'call',     label: 'Call',       icon: Phone,         tone: 'emerald' },
    { key: 'whatsapp', label: 'WhatsApp',   icon: MessageCircle, tone: 'emerald' },
    { key: 'sms',      label: 'SMS',        icon: MessageSquare, tone: 'purple' },
    { key: 'email',    label: 'Email',      icon: Mail,          tone: 'amber' },
    { key: 'note',     label: 'Note',       icon: StickyNote,    tone: 'purple' },
    { key: 'followUp', label: 'Reply + FU', icon: Calendar,      tone: 'amber' },
  ].filter((a) => permissions[a.key]);

  const slaTone =
    sla?.state === 'breached' ? 'border-rose-200 bg-rose-50' :
    sla?.state === 'warning'  ? 'border-amber-200 bg-amber-50' :
    sla?.state === 'on-track' ? 'border-emerald-200 bg-emerald-50' :
    'border-brand-lilac bg-brand-mist/40';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-3xl bg-white shadow-panel">
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
                Conversation
              </p>
              <h3 className="truncate font-display text-lg font-semibold text-brand-ink">
                {conversation.customer}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateState('resolved')}
                className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 sm:flex"
              >
                <CheckCircle2 size={11} /> Resolve
              </button>
              <button
                onClick={() => onUpdateState('closed')}
                className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 sm:flex"
              >
                <Archive size={11} /> Close
              </button>
              <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-5 p-5">
            {sla && (
              <div className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${slaTone}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ${
                  sla.state === 'breached' ? 'text-rose-600' :
                  sla.state === 'warning' ? 'text-amber-700' :
                  'text-emerald-600'
                }`}>
                  <Timer size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                    Response SLA · Target {sla.target} min
                  </p>
                  <p className="text-sm font-bold text-brand-ink">{sla.label}</p>
                </div>
                <div className="hidden shrink-0 items-center gap-1 sm:flex">
                  <span className="h-1.5 w-24 overflow-hidden rounded-full bg-brand-lilac">
                    <span
                      className={`block h-full rounded-full ${
                        sla.state === 'breached' ? 'bg-rose-500' :
                        sla.state === 'warning'  ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (sla.minutes / sla.target) * 100)}%` }}
                    />
                  </span>
                </div>
              </div>
            )}

            <div className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${
              conversation.state === 'needs_reply' ? 'border-rose-200 bg-rose-50' :
              conversation.state === 'waiting'     ? 'border-amber-200 bg-amber-50' :
              conversation.state === 'followup'    ? 'border-violet-200 bg-violet-50' :
                                                     'border-emerald-200 bg-emerald-50'
            }`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ${
                conversation.state === 'needs_reply' ? 'text-rose-600' :
                conversation.state === 'waiting'     ? 'text-amber-700' :
                conversation.state === 'followup'    ? 'text-brand-purple' :
                                                       'text-emerald-600'
              }`}>
                <ActionIcon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                  Next Action
                </p>
                <p className="text-sm font-bold text-brand-ink">{action.label}</p>
                <p className="mt-0.5 text-[11px] text-brand-ink/60">{action.reason}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${state.tone === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-white text-brand-ink/60'}`}>
                {state.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {actions.map((a) => {
                const Icon = a.icon;
                const tones = {
                  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600',  ring: 'ring-emerald-200' },
                  purple:  { bg: 'bg-violet-50',  text: 'text-brand-purple', ring: 'ring-violet-200' },
                  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',    ring: 'ring-amber-200' },
                };
                const t = tones[a.tone];
                const isFU = a.key === 'followUp';
                return (
                  <button
                    key={a.key}
                    onClick={() => isFU ? onReplyFU() : onPickChannel(a.key, conversation.lastMessage)}
                    className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-2.5 text-[10px] font-bold text-brand-ink transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-sm"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.bg} ${t.text} ring-1 ${t.ring}`}>
                      <Icon size={14} />
                    </span>
                    {a.label}
                  </button>
                );
              })}
            </div>

            <div className="card !p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <History size={12} /> Customer Timeline
              </p>

              <div className="space-y-4">
                {groupedByDay.map(([dayKey, msgs]) => (
                  <div key={dayKey}>
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                      <Calendar size={10} /> {dayLabel(dayKey)}
                    </p>
                    <div className="relative space-y-2 pl-3">
                      <span className="pointer-events-none absolute left-[7px] top-1.5 bottom-1.5 w-px bg-brand-lilac" />
                      {msgs.map((m) => (
                        <TimelineEntry key={m.id} message={m} onMarkRead={() => onMarkRead(m)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-brand-lilac bg-brand-mist/20 lg:block">
          <div className="p-5">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-magenta">
              <Sparkles size={11} /> Customer Context
            </p>

            <div className="space-y-2.5">
              <ContextLine icon={User}      label="Lead ID"      value={conversation.leadId} />
              <ContextLine icon={Flame}     label="Lead Stage"   value={conversation.leadStage} />
              <ContextLine icon={Building2} label="Campaign"     value={conversation.campaign} />
              <ContextLine icon={Layers}    label="Source"       value={conversation.source} />
              <ContextLine icon={Target}    label="Priority"     value={conversation.priority} />
              <ContextLine icon={IndianRupee} label="Budget"     value={conversation.budget} />
              <ContextLine icon={MapPin}    label="Location"     value={conversation.location} />
              <ContextLine icon={Target}    label="Last Outcome" value={conversation.lastOutcome} />
              <ContextLine icon={Phone}     label="Mobile"       value={conversation.mobile} />
              {conversation.email && (
                <ContextLine icon={Mail} label="Email" value={conversation.email} />
              )}
              <ContextLine icon={MessageSquare} label="Messages"  value={String(conversation.messages.length)} />
              <ContextLine icon={Calendar}      label="Next Follow-Up" value={conversation.nextFollowUp || '—'} />
              {conversation.preferredContact && conversation.preferredContact !== '—' && (
                <ContextLine icon={Clock} label="Preferred Contact" value={conversation.preferredContact} />
              )}
            </div>

            {conversation.preferredContact && conversation.preferredContact !== '—' && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  <AlertTriangle size={10} /> Preferred Contact
                </p>
                <p className="text-[11px] text-amber-800">{conversation.preferredContact}</p>
              </div>
            )}

            {conversation.tags.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {conversation.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-ink/70 ring-1 ring-brand-lilac">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                Lead Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <QuickLeadAction icon={Phone}         label="Call" />
                <QuickLeadAction icon={MessageCircle} label="WhatsApp" />
                <QuickLeadAction icon={MessageSquare} label="SMS" />
                <QuickLeadAction icon={ExternalLink}  label="View Lead" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function QuickLeadAction({ icon: Icon, label }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white p-2 text-center transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40">
      <Icon size={14} className="text-brand-magenta" />
      <span className="text-[10px] font-semibold text-brand-ink/70">{label}</span>
    </button>
  );
}

function TimelineEntry({ message, onMarkRead }) {
  const channel = CHANNELS.find((c) => c.key === message.channel) || CHANNELS[0];
  const Icon = channel.icon;
  const isIncoming = message.direction === 'incoming';
  const isNote = message.channel === 'note';
  const isFailed = message.status === 'failed';

  return (
    <div className="relative flex items-start gap-3">
      <span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
        isNote ? 'bg-amber-100 text-amber-700' :
        isFailed ? 'bg-rose-100 text-rose-500' :
        isIncoming ? 'bg-violet-100 text-brand-purple' :
        'bg-slate-100 text-slate-600'
      }`}>
        <Icon size={11} />
      </span>

      <div
        onClick={message.unread ? onMarkRead : undefined}
        className={`min-w-0 flex-1 rounded-lg border px-3 py-2 transition-all ${
          isFailed
            ? 'cursor-pointer border-rose-200 bg-rose-50/60 hover:bg-rose-50'
            : isNote
            ? 'border-amber-200 bg-amber-50/60'
            : isIncoming
            ? 'border-brand-lilac/60 bg-brand-mist/40'
            : 'border-brand-magenta/30 bg-brand-magenta/[0.03]'
        }`}
      >
        <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            {isNote ? (
              <span className="text-amber-700">Internal Note</span>
            ) : isIncoming ? (
              <span className="text-brand-purple">Customer · {channel.label}</span>
            ) : (
              <span className="text-brand-magenta">You · {channel.label}</span>
            )}
            {message.unread && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                Unread
              </span>
            )}
            {isFailed && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                Failed
              </span>
            )}
          </span>
          <span className="text-brand-ink/40">{formatDateTime(message.at)}</span>
        </div>
        <p className="text-sm text-brand-ink/85">{message.body}</p>

        {message.attachments?.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-brand-lilac/60 bg-white px-2 py-1 text-[10px]">
                <Paperclip size={10} className="text-brand-ink/50" />
                <span className="truncate font-medium text-brand-ink">{a.name}</span>
                <span className="ml-auto text-brand-ink/40">{a.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContextLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/40 pb-1.5 text-[11px] last:border-b-0">
      <span className="flex shrink-0 items-center gap-1.5 text-brand-ink/50">
        <Icon size={10} /> {label}
      </span>
      <span className="truncate font-semibold capitalize text-brand-ink">{value || '—'}</span>
    </div>
  );
}

/* ================================================================
   MESSAGE DRAWER
   ================================================================ */
function MessageDrawer({ message, permissions, onClose, onPickChannel, onRetry }) {
  const channel = CHANNELS.find((c) => c.key === message.channel) || CHANNELS[0];
  const Icon = channel.icon;
  const isIncoming = message.direction === 'incoming';
  const isNote = message.channel === 'note';
  const isFailed = message.status === 'failed';
  const sla = isIncoming && message.unread ? getSLAState(message) : null;

  const actions = [
    { key: 'call',     label: 'Call',       icon: Phone,         tone: 'emerald' },
    { key: 'whatsapp', label: 'WhatsApp',   icon: MessageCircle, tone: 'emerald' },
    { key: 'sms',      label: 'SMS',        icon: MessageSquare, tone: 'purple' },
    { key: 'email',    label: 'Email',      icon: Mail,          tone: 'amber' },
    { key: 'note',     label: 'Note',       icon: StickyNote,    tone: 'purple' },
    { key: 'followUp', label: 'Reply + FU', icon: Calendar,      tone: 'amber' },
  ].filter((a) => permissions[a.key]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="min-w-0">
            <p className={`font-mono text-[10px] uppercase tracking-wider ${channel.text}`}>
              {channel.label} · {isNote ? 'Internal' : isIncoming ? 'Incoming' : 'Outgoing'}
            </p>
            <h3 className="truncate font-display text-lg font-semibold text-brand-ink">
              {message.customer}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {sla && (
            <div className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${
              sla.state === 'breached' ? 'border-rose-200 bg-rose-50' :
              sla.state === 'warning'  ? 'border-amber-200 bg-amber-50' :
              'border-emerald-200 bg-emerald-50'
            }`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ${
                sla.state === 'breached' ? 'text-rose-600' :
                sla.state === 'warning' ? 'text-amber-700' :
                'text-emerald-600'
              }`}>
                <Timer size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                  Response SLA · Target {sla.target} min
                </p>
                <p className="text-sm font-bold text-brand-ink">{sla.label}</p>
              </div>
            </div>
          )}

          {isFailed && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600">
                <AlertTriangle size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Delivery Failed
                </p>
                <p className="text-sm font-bold text-rose-800">Retry or use another channel</p>
              </div>
              <button
                onClick={onRetry}
                className="shrink-0 rounded-lg bg-rose-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-card hover:bg-rose-600"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className={`flex h-14 w-14 items-center justify-center rounded-full ${channel.bg} ${channel.text} ring-2 ${channel.border}`}>
              <Icon size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{message.customer}</p>
              <p className="text-sm text-brand-ink/50">{message.mobile}</p>
              {message.email && (
                <p className="flex items-center gap-1 text-xs text-brand-ink/50">
                  <Mail size={11} /> {message.email}
                </p>
              )}
            </div>
            {!isNote && (
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[message.status] || STATUS_STYLES.sent}`}>
                {message.status}
              </span>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${
            isNote ? 'border-amber-200 bg-amber-50' : 'border-brand-lilac bg-brand-mist/30'
          }`}>
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
              <MessageSquare size={11} /> {isNote ? 'Internal Note' : 'Message'}
            </p>
            <p className="whitespace-pre-line text-sm text-brand-ink/85">{message.body}</p>
          </div>

          {!isFailed && (
            <div className="grid grid-cols-3 gap-2">
              {actions.map((a) => {
                const Icon = a.icon;
                const tones = {
                  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600',  ring: 'ring-emerald-200' },
                  purple:  { bg: 'bg-violet-50',  text: 'text-brand-purple', ring: 'ring-violet-200' },
                  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',    ring: 'ring-amber-200' },
                };
                const t = tones[a.tone];
                return (
                  <button
                    key={a.key}
                    onClick={() => onPickChannel(a.key)}
                    className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-2.5 text-[10px] font-bold text-brand-ink transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-sm"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.bg} ${t.text} ring-1 ${t.ring}`}>
                      <Icon size={14} />
                    </span>
                    {a.label}
                  </button>
                );
              })}
            </div>
          )}

          {message.attachments?.length > 0 && (
            <div className="card !p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <Paperclip size={12} /> Attachments
              </p>
              <div className="space-y-1.5">
                {message.attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-brand-lilac/60 bg-white px-3 py-2 text-xs">
                    <FileText size={12} className="text-brand-ink/50" />
                    <span className="truncate font-medium text-brand-ink">{a.name}</span>
                    <span className="ml-auto text-[10px] text-brand-ink/40">{a.size}</span>
                    <button className="rounded-md p-1 text-brand-ink/50 hover:bg-brand-lilac/40">
                      <Download size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   RETRY MODAL
   ================================================================ */
function RetryModal({ message, onClose, onRetry, onPickChannel }) {
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Message Failed</h3>
              <p className="text-xs text-brand-ink/50">{message.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">
            Reason
          </p>
          <p className="text-sm text-rose-800">Invalid number or delivery failed.</p>
        </div>

        <p className="mb-3 text-xs font-semibold text-brand-ink/70">Suggested actions</p>

        <div className="space-y-2">
          <button
            onClick={() => onRetry(message, message.channel)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-3 text-left transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
              <RefreshCw size={14} className="text-brand-magenta" />
              Retry {channelLabel(message.channel)}
            </span>
            <ChevronRight size={14} className="text-brand-ink/30" />
          </button>
          {message.channel !== 'whatsapp' && (
            <button
              onClick={() => onRetry(message, 'whatsapp')}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-3 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                <MessageCircle size={14} className="text-emerald-600" />
                Send via WhatsApp
              </span>
              <ChevronRight size={14} className="text-brand-ink/30" />
            </button>
          )}
          <button
            onClick={() => onPickChannel('call')}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-3 text-left transition-all hover:border-rose-400 hover:bg-rose-50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
              <Phone size={14} className="text-brand-magenta" />
              Call Customer
            </span>
            <ChevronRight size={14} className="text-brand-ink/30" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SNOOZE MODAL
   ================================================================ */
function SnoozeModal({ message, onClose, onSave }) {
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Snooze Follow-Up</h3>
              <p className="text-xs text-brand-ink/50">{message.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {SNOOZE_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onSave(message, p.value)}
              className="flex w-full items-center justify-between rounded-xl border border-brand-lilac bg-white px-4 py-3 text-sm font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            >
              <span>{p.label}</span>
              <ChevronRight size={14} className="text-brand-ink/30" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   REPLY + FOLLOW-UP MODAL
   ================================================================ */
function ReplyFollowUpModal({ target, onClose, onSend }) {
  const [channel, setChannel] = useState('whatsapp');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(todayYMD());
  const [time, setTime] = useState('10:00');

  const meta = CHANNELS.find((c) => c.key === channel) || CHANNELS[0];
  const canSend = body.trim() && date;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Reply + Follow-Up</h3>
              <p className="text-xs text-brand-ink/50">Send a reply and schedule the next action</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-1.5 rounded-xl border border-brand-lilac bg-brand-mist/40 p-1.5">
          {CHANNELS.filter((c) => c.key !== 'call' && c.key !== 'note').map((c) => {
            const CIcon = c.icon;
            const active = channel === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setChannel(c.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  active
                    ? `bg-white ${c.text} shadow-sm ring-1 ${c.border}`
                    : 'text-brand-ink/60 hover:text-brand-ink'
                }`}
              >
                <CIcon size={13} />
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Reply to {target.customer} *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Type your reply…"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              <Calendar size={11} /> Follow-Up Schedule
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            disabled={!canSend}
            onClick={() =>
              onSend({
                channel,
                customer: target.customer,
                mobile: target.mobile,
                email: target.email,
                body: body.trim(),
                followUp: `${date} · ${time}`,
              })
            }
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} /> Send & Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   COMPOSE MODAL
   ================================================================ */
function ComposeModal({ initialChannel = 'sms', preset, onClose, onSend }) {
  const [channel, setChannel] = useState(initialChannel);
  const [customer, setCustomer] = useState(preset?.customer || '');
  const [mobile, setMobile] = useState(preset?.mobile || '');
  const [email, setEmail] = useState(preset?.email || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const { user } = useAuth();
  const meta = CHANNELS.find((c) => c.key === channel) || CHANNELS[0];
  const isEmail = channel === 'email';

  const templateVars = {
    customer_name: customer.split(' ')[0] || 'Customer',
    agent_name: user?.name?.split(' ')[0] || 'Agent',
    project_name: 'Green Valley Apartments',
    property_type: '2BHK',
    appointment_date: 'tomorrow at 4 PM',
    document_name: 'ID proof',
  };

  const applyTemplate = (tpl) => {
    setBody(renderTemplate(tpl.body, templateVars));
    setShowTemplates(false);
  };

  const canSend =
    customer.trim() &&
    (isEmail ? email.trim() && subject.trim() && body.trim() : mobile.trim() && body.trim());

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Send size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Send {meta.label}
              </h3>
              <p className="text-xs text-brand-ink/50">Reach out to your customer</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-1.5 rounded-xl border border-brand-lilac bg-brand-mist/40 p-1.5">
          {CHANNELS.filter((c) => c.key !== 'call' && c.key !== 'note').map((c) => {
            const CIcon = c.icon;
            const active = channel === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setChannel(c.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  active
                    ? `bg-white ${c.text} shadow-sm ring-1 ${c.border}`
                    : 'text-brand-ink/60 hover:text-brand-ink'
                }`}
              >
                <CIcon size={13} />
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer Name *" value={customer} onChange={setCustomer} placeholder="e.g. Rahul Kumar" />
            {isEmail ? (
              <Field label="Email *" value={email} onChange={setEmail} placeholder="name@example.com" />
            ) : (
              <Field label="Mobile *" value={mobile} onChange={(v) => setMobile(v.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" />
            )}
          </div>

          {isEmail && (
            <Field label="Subject *" value={subject} onChange={setSubject} placeholder="What is this about?" />
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-brand-ink/70">
                Message {isEmail ? '*' : ''}
              </label>
              <button
                onClick={() => setShowTemplates((s) => !s)}
                className="inline-flex items-center gap-1 rounded-full border border-brand-lilac bg-white px-2.5 py-1 text-[10px] font-bold text-brand-magenta hover:border-brand-magenta/40"
              >
                <BookOpen size={10} /> Templates
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={isEmail ? 6 : 4}
              placeholder={isEmail ? 'Write your email…' : 'Type your message…'}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          {showTemplates && (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-brand-lilac bg-brand-mist/30 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-magenta">
                <BookOpen size={11} /> Template Library
              </p>
              {Object.entries(TEMPLATE_LIBRARY).map(([key, group]) => (
                <div key={key} className="mb-3 last:mb-0">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-ink/40">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplate(t)}
                        className="flex w-full items-start gap-2 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-left text-[11px] font-semibold text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta"
                      >
                        <FileText size={11} className="mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold">{t.label}</p>
                          <p className="mt-0.5 truncate text-[10px] text-brand-ink/50">
                            {renderTemplate(t.body, templateVars)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            disabled={!canSend}
            onClick={() =>
              onSend({
                channel, customer: customer.trim(),
                mobile: mobile.trim(), email: email.trim(),
                subject, body: body.trim(),
              })
            }
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   QUICK ACTION MODAL
   ================================================================ */
function QuickActionModal({ target, permissions, onClose, onPick }) {
  const actions = [
    { key: 'call',     label: 'Call',       icon: Phone,         tone: 'rose' },
    { key: 'whatsapp', label: 'WhatsApp',   icon: MessageCircle, tone: 'emerald' },
    { key: 'sms',      label: 'SMS',        icon: MessageSquare, tone: 'purple' },
    { key: 'email',    label: 'Email',      icon: Mail,          tone: 'amber' },
    { key: 'note',     label: 'Add Note',   icon: StickyNote,    tone: 'purple' },
    { key: 'followUp', label: 'Reply + FU', icon: Calendar,      tone: 'amber' },
  ].filter((a) => permissions[a.key]);

  const tones = {
    rose:    { bg: 'bg-rose-50',    text: 'text-brand-magenta', ring: 'ring-rose-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600',   ring: 'ring-emerald-200' },
    purple:  { bg: 'bg-violet-50',  text: 'text-brand-purple',  ring: 'ring-violet-200' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',     ring: 'ring-amber-200' },
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Quick Action</h3>
              <p className="text-xs text-brand-ink/50">{target.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            const t = tones[a.tone];
            return (
              <button
                key={a.key}
                onClick={() => onPick(a.key)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-3 text-[10px] font-bold text-brand-ink transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-sm"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.bg} ${t.text} ring-1 ${t.ring}`}>
                  <Icon size={16} />
                </span>
                {a.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   NOTE MODAL
   ================================================================ */
function NoteModal({ message, onClose, onSave }) {
  const [text, setText] = useState('');
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <StickyNote size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Internal Note</h3>
              <p className="text-xs text-brand-ink/50">{message.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <strong>Only CRM staff can see this.</strong> The customer will not receive it.
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Add context for this customer…"
          className="w-full rounded-xl border border-amber-200 bg-amber-50/40 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
        />

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onSave(message, text.trim())}
            disabled={!text.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   HELPERS
   ================================================================ */
const channelLabel = (key) =>
  ({ sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email', call: 'Call', note: 'Note' }[key] || key);

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      />
    </div>
  );
}

function EmptyState({ tab }) {
  const messages = {
    inbox:    'No pending conversations — nice!',
    sms:      'No SMS conversations yet',
    whatsapp: 'No WhatsApp messages yet',
    email:    'No email threads yet',
    history:  'No communication history yet',
  };
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {messages[tab] || 'Nothing to show'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        Communications will appear here as soon as they are sent or received.
      </p>
    </div>
  );
}

/* ================================================================
   ANIMATED STAT CARD
   ================================================================ */
function useAnimatedCount(target, duration = 600) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    const to = Number(target) || 0;
    const tick = (now) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display.toLocaleString();
}

function AnimatedStatCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
  const numeric = typeof value === 'number' ? value : 0;
  const animated = useAnimatedCount(numeric);
  const display = typeof value === 'number' ? animated : value;

  const themes = {
    purple: {
      border: 'border-violet-200 hover:border-violet-400',
      bg: 'from-violet-50 via-violet-50/30 to-white',
      iconBg: 'bg-violet-100 text-brand-purple border-violet-200',
      bar: 'from-brand-purple to-brand-magenta',
      glow: 'bg-brand-purple/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]',
      valueColor: 'text-brand-purple',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      bg: 'from-emerald-50 via-emerald-50/30 to-white',
      iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      bar: 'from-emerald-500 to-emerald-400',
      glow: 'bg-emerald-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]',
      valueColor: 'text-emerald-600',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      bg: 'from-amber-50 via-amber-50/30 to-white',
      iconBg: 'bg-amber-100 text-amber-600 border-amber-200',
      bar: 'from-amber-500 to-orange-400',
      glow: 'bg-amber-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]',
      valueColor: 'text-amber-600',
    },
    rose: {
      border: 'border-rose-200 hover:border-rose-400',
      bg: 'from-rose-50 via-rose-50/30 to-white',
      iconBg: 'bg-rose-100 text-brand-magenta border-rose-200',
      bar: 'from-brand-magenta to-brand-purple',
      glow: 'bg-brand-magenta/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]',
      valueColor: 'text-brand-magenta',
    },
  };
  const t = themes[color] || themes.purple;

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 animate-fade-slide-in ${t.border} ${t.shadow}`}
    >
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} />
          </span>
        </div>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {display}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
      </div>
    </div>
  );
}

/* ================================================================
   TOAST
   ================================================================ */
function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}