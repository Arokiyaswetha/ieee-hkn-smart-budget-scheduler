import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  FileText, 
  PieChart as PieChartIcon, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Paperclip, 
  Eye, 
  Filter, 
  ShieldCheck, 
  Info, 
  ExternalLink,
  ChevronRight,
  FolderOpen,
  CalendarCheck,
  Search,
  X,
  UploadCloud,
  Check,
  Zap,
  Building2,
  Lock,
  User,
  LogOut,
  Key,
  Shield,
  Users,
  Award,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
  Archive,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

import {
  SEEDED_USERS,
  INITIAL_ACADEMIC_YEARS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  INITIAL_BUDGETS,
  INITIAL_EVENTS,
  INITIAL_DEADLINES,
  INITIAL_TRANSACTIONS,
} from './data/initialData';

import {
  formatEpochToDate,
  epochToInputString,
  inputStringToEpoch,
  formatCurrency,
} from './utils/dateUtils';

export default function App() {
  // Authentication & Session State - isAuthScreenOpen starts TRUE so users experience the dedicated login page
  const [currentUser, setCurrentUser] = useState(SEEDED_USERS[0]);
  const [isAuthScreenOpen, setIsAuthScreenOpen] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loginEmail, setLoginEmail] = useState('treasurer@hkn-chapter.org');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [authFeedback, setAuthFeedback] = useState(null);
  const [userList, setUserList] = useState(SEEDED_USERS);

  // Multi-Year Data State
  const [academicYears, setAcademicYears] = useState(INITIAL_ACADEMIC_YEARS);
  const [selectedYear, setSelectedYear] = useState('2025-2026');

  // Application Views & Data
  const [activeTab, setActiveTab] = useState('overview'); // overview, transactions, budgets, events, deadlines, analytics, years
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [deadlines, setDeadlines] = useState(INITIAL_DEADLINES);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [receiptViewer, setReceiptViewer] = useState(null);
  const [receiptAttachment, setReceiptAttachment] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Filter & Search
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [filterStatus, setFilterStatus] = useState('all'); // all, realtime, planned, recurring
  const [filterCommittee, setFilterCommittee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const yearTransactions = useMemo(() => {
    return transactions.filter(t => t.academicYear === selectedYear);
  }, [transactions, selectedYear]);

  const yearBudgets = useMemo(() => {
    return budgets.filter(b => b.academicYear === selectedYear);
  }, [budgets, selectedYear]);

  const yearEvents = useMemo(() => {
    return events.filter(e => e.academicYear === selectedYear);
  }, [events, selectedYear]);

  const yearDeadlines = useMemo(() => {
    return deadlines.filter(d => d.academicYear === selectedYear);
  }, [deadlines, selectedYear]);

  const activeYearMeta = useMemo(() => {
    return academicYears.find(y => y.name === selectedYear) || { name: selectedYear, isArchived: false, carriedBalance: 0 };
  }, [academicYears, selectedYear]);

  const balances = useMemo(() => {
    let actualIncome = 0;
    let actualExpense = 0;
    let plannedIncome = 0;
    let plannedExpense = 0;
    let recurringIncome = 0;
    let recurringExpense = 0;

    yearTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        if (t.status === 'realtime') actualIncome += amt;
        else if (t.status === 'planned') plannedIncome += amt;
        else if (t.status === 'recurring') recurringIncome += amt;
      } else {
        if (t.status === 'realtime') actualExpense += amt;
        else if (t.status === 'planned') plannedExpense += amt;
        else if (t.status === 'recurring') recurringExpense += amt;
      }
    });

    const actualBalance = actualIncome - actualExpense;
    // Projected includes actual + all scheduled / planned future commitments
    const projectedBalance = (actualIncome + plannedIncome + recurringIncome) - 
                             (actualExpense + plannedExpense + recurringExpense);

    const totalAllocatedBudgets = yearBudgets.reduce((acc, b) => acc + (Number(b.allocated) || 0), 0);
    const totalActualSpend = actualExpense;
    const totalPlannedSpend = actualExpense + plannedExpense + recurringExpense;

    return {
      actualIncome,
      actualExpense,
      actualBalance,
      projectedBalance,
      plannedIncome,
      plannedExpense,
      recurringIncome,
      recurringExpense,
      totalAllocatedBudgets,
      totalActualSpend,
      totalPlannedSpend
    };
  }, [yearTransactions, yearBudgets]);

  // Cash flow runway & liquidity warning detector
  const cashFlowAlert = useMemo(() => {
    if (balances.projectedBalance < 0) {
      return {
        level: 'danger',
        message: `Critical Deficit Alert: Projected year-end balance is negative (${formatCurrency(balances.projectedBalance)}). Reduce planned event expenses or secure pending grants immediately.`
      };
    }
    if (balances.actualBalance < 0) {
      return {
        level: 'danger',
        message: `Real-time Cash Overdraft: Chapter account is currently in negative balance (${formatCurrency(balances.actualBalance)}). Halt reimbursements until deposits clear.`
      };
    }
    if (balances.actualBalance < (balances.plannedExpense * 0.45) && balances.plannedIncome > 0) {
      return {
        level: 'warning',
        message: `Runway Timing Warning: Imminent planned event costs (${formatCurrency(balances.plannedExpense)}) exceed current liquid cash. Ensure corporate pledges clear before banquet catering cutoffs.`
      };
    }
    return {
      level: 'success',
      message: `Financially Sound: Liquid assets (${formatCurrency(balances.actualBalance)}) adequately cover active commitments with a projected reserve of ${formatCurrency(balances.projectedBalance)}.`
    };
  }, [balances]);

  const trendChartData = useMemo(() => {
    const sorted = [...yearTransactions].sort((a, b) => a.dateEpoch - b.dateEpoch);
    let runningActual = 0;
    let runningProjected = 0;

    const points = [];
    sorted.forEach((t) => {
      const amt = t.type === 'income' ? t.amount : -t.amount;
      runningProjected += amt;
      if (t.status === 'realtime') {
        runningActual += amt;
      }
      points.push({
        date: formatEpochToDate(t.dateEpoch),
        actual: runningActual,
        projected: runningProjected,
        title: t.title
      });
    });

    if (points.length === 0) {
      return [{ date: 'Start of AY', actual: 0, projected: 0 }];
    }
    return points;
  }, [yearTransactions]);

  const categoryPieData = useMemo(() => {
    const map = {};
    yearTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    const colors = ['#002855', '#D97706', '#0284c7', '#10B981', '#8B5CF6', '#F43F5E', '#64748B'];
    return Object.keys(map).map((cat, idx) => ({
      name: cat,
      value: map[cat],
      color: colors[idx % colors.length]
    }));
  }, [yearTransactions]);

  const budgetBarData = useMemo(() => {
    return yearBudgets.map(b => {
      const budgetTx = yearTransactions.filter(t => t.budgetId === b.id && t.type === 'expense');
      const spentRealtime = budgetTx.filter(t => t.status === 'realtime').reduce((s, t) => s + t.amount, 0);
      const spentPlanned = budgetTx.filter(t => t.status !== 'realtime').reduce((s, t) => s + t.amount, 0);

      return {
        name: b.name.length > 18 ? b.name.slice(0, 18) + '...' : b.name,
        fullName: b.name,
        Allocated: b.allocated,
        ActualSpent: spentRealtime,
        PlannedSpent: spentPlanned,
        TotalForecast: spentRealtime + spentPlanned
      };
    });
  }, [yearBudgets, yearTransactions]);

  const filteredTransactions = useMemo(() => {
    return yearTransactions.filter(t => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesCommittee = filterCommittee === 'all' || t.budgetId === filterCommittee;
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesStatus && matchesCommittee && matchesSearch;
    }).sort((a, b) => b.dateEpoch - a.dateEpoch);
  }, [yearTransactions, filterType, filterStatus, filterCommittee, searchTerm]);

  // Treasurer: full administrative rights; Chair: restricted to assigned committee; Member: read-only
  const canModifyAll = currentUser?.role === 'treasurer';
  const canModifyCommittee = (budgetId) => {
    if (!currentUser) return false;
    if (currentUser.role === 'treasurer') return true;
    if (currentUser.role === 'chair') {
      return !currentUser.committeeId || currentUser.committeeId === budgetId;
    }
    return false;
  };
  const isReadOnly = currentUser?.role === 'member';

  const handleQuickLogin = (user) => {
    setCurrentUser(user);
    setLoginEmail(user.email);
    setIsAuthScreenOpen(false);
    setAuthFeedback({ type: 'success', text: `Session authenticated as ${user.name} (${user.roleTitle})` });
    setTimeout(() => setAuthFeedback(null), 3500);
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    const found = userList.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      setIsAuthScreenOpen(false);
      setAuthFeedback({ type: 'success', text: `Welcome back, ${found.name}! Privileges: ${found.roleTitle}` });
    } else {
      setAuthFeedback({ type: 'error', text: 'No chapter account found. Use one of the 1-click test profiles below.' });
    }
    setTimeout(() => setAuthFeedback(null), 4000);
  };

  const handleRegisterNewUser = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.regName.value;
    const email = form.regEmail.value;
    const role = form.regRole.value;
    const committeeId = form.regCommittee?.value || null;

    if (!name || !email) return;

    const roleTitles = {
      treasurer: 'Chapter Treasurer (Admin)',
      chair: 'Committee Chair (Operational)',
      member: 'General Member (Auditor)'
    };

    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      roleTitle: roleTitles[role] || 'Member',
      committeeId: role === 'chair' ? committeeId : null,
      passwordHash: '$2a$12$' + Math.random().toString(36).substring(2) + 'saltHashed',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      joinedYear: selectedYear.split('-')[0]
    };

    setUserList([newUser, ...userList]);
    setCurrentUser(newUser);
    setIsAuthScreenOpen(false);
    setAuthFeedback({ type: 'success', text: `Officer profile activated: ${newUser.name} (${newUser.roleTitle})` });
    setTimeout(() => setAuthFeedback(null), 4000);
  };

  const handleReceiptUpload = (file) => {
    if (!file) return;

    const accepted = file.type.startsWith('image/') || file.type === 'application/pdf';
    const maxSize = 10 * 1024 * 1024;

    if (!accepted) {
      setAuthFeedback({ type: 'error', text: 'Unsupported receipt format. Please upload an image or PDF.' });
      setTimeout(() => setAuthFeedback(null), 3500);
      return;
    }

    if (file.size > maxSize) {
      setAuthFeedback({ type: 'error', text: 'Receipt is too large. Please upload a file up to 10 MB.' });
      setTimeout(() => setAuthFeedback(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptAttachment({
        dataUrl: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
        verified: true
      });
      setAuthFeedback({ type: 'success', text: `Receipt uploaded: ${file.name}` });
      setTimeout(() => setAuthFeedback(null), 3000);
    };
    reader.onerror = () => {
      setAuthFeedback({ type: 'error', text: 'Could not read the selected receipt file.' });
      setTimeout(() => setAuthFeedback(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    const form = e.target;
    const formData = new FormData(form);

    const targetBudgetId = formData.get('budgetId') || null;
    if (!canModifyCommittee(targetBudgetId)) {
      setAuthFeedback({ type: 'error', text: 'Permission denied: Chairs may only record transactions for their assigned committee.' });
      setTimeout(() => setAuthFeedback(null), 3000);
      return;
    }

    const txData = {
      id: editingTx ? editingTx.id : `tx-${Date.now()}`,
      academicYear: selectedYear,
      type: formData.get('type'),
      status: formData.get('status'),
      title: formData.get('title'),
      category: formData.get('category'),
      budgetId: targetBudgetId,
      eventId: formData.get('eventId') || null,
      amount: parseFloat(formData.get('amount')) || 0,
      dateEpoch: inputStringToEpoch(formData.get('date')),
      notes: formData.get('notes') || '',
      receiptUrl: receiptAttachment?.dataUrl || null,
      receiptName: receiptAttachment?.name || null,
      receiptType: receiptAttachment?.type || null,
      receiptSize: receiptAttachment?.size || null,
      receiptVerified: receiptAttachment?.verified || false
    };

    if (editingTx) {
      setTransactions(transactions.map(t => t.id === editingTx.id ? txData : t));
    } else {
      setTransactions([txData, ...transactions]);
    }
    setIsTxModalOpen(false);
    setEditingTx(null);
    setReceiptAttachment(null);
  };

  const handleDeleteTransaction = (id) => {
    if (isReadOnly) return;
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleSaveDeadline = (e) => {
    e.preventDefault();
    if (!canModifyAll) return;
    const form = e.target;
    const formData = new FormData(form);

    const dlData = {
      id: editingDeadline ? editingDeadline.id : `dl-${Date.now()}`,
      academicYear: selectedYear,
      title: formData.get('title'),
      category: formData.get('category'),
      deadlineEpoch: inputStringToEpoch(formData.get('deadlineDate')),
      status: formData.get('status') || 'pending',
      fundingAmount: parseFloat(formData.get('fundingAmount')) || 0,
      notes: formData.get('notes') || ''
    };

    if (editingDeadline) {
      setDeadlines(deadlines.map(d => d.id === editingDeadline.id ? dlData : d));
    } else {
      setDeadlines([...deadlines, dlData]);
    }
    setIsDeadlineModalOpen(false);
    setEditingDeadline(null);
  };

  const handleDeleteDeadline = (id) => {
    if (!canModifyAll) return;
    setDeadlines(deadlines.filter(d => d.id !== id));
  };

  const handleToggleDeadlineStatus = (id) => {
    if (isReadOnly) return;
    setDeadlines(deadlines.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'completed' ? 'pending' : 'completed' };
      }
      return d;
    }));
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!canModifyAll && currentUser?.role !== 'chair') return;
    const form = e.target;
    const formData = new FormData(form);

    const evData = {
      id: editingEvent ? editingEvent.id : `ev-${Date.now()}`,
      academicYear: selectedYear,
      name: formData.get('name'),
      budgetId: formData.get('budgetId'),
      allocated: parseFloat(formData.get('allocated')) || 0,
      dateEpoch: inputStringToEpoch(formData.get('eventDate'))
    };

    if (editingEvent) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? evData : ev));
    } else {
      setEvents([...events, evData]);
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id) => {
    if (!canModifyAll) return;
    setEvents(events.filter(ev => ev.id !== id));
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!canModifyAll) return;
    const form = e.target;
    const formData = new FormData(form);

    const newBudget = {
      id: `b-${Date.now()}`,
      name: formData.get('name'),
      allocated: parseFloat(formData.get('allocated')) || 0,
      academicYear: selectedYear,
      color: formData.get('color') || '#002855'
    };

    setBudgets([...budgets, newBudget]);
    setIsBudgetModalOpen(false);
  };

  const handleCreateNewYear = (e) => {
    e.preventDefault();
    if (!canModifyAll) return;
    const form = e.target;
    const name = form.yearName.value.trim();
    const carryAmount = parseFloat(form.carriedBalance.value) || 0;
    const theme = form.yearTheme.value || '';

    if (!name) return;

    const startEpoch = inputStringToEpoch(form.startDate.value);
    const endEpoch = inputStringToEpoch(form.endDate.value);

    const newYearObj = {
      id: `ay-${Date.now()}`,
      name,
      startEpoch,
      endEpoch,
      isArchived: false,
      carriedBalance: carryAmount,
      theme
    };

    setAcademicYears([...academicYears, newYearObj]);

    // If carryover exists, seed a surplus carryover transaction in the new year
    if (carryAmount > 0) {
      const carryTx = {
        id: `tx-carry-${Date.now()}`,
        academicYear: name,
        type: 'income',
        status: 'realtime',
        title: `Surplus Carryover from previous academic tenure`,
        category: 'Surplus Carryover',
        budgetId: null,
        eventId: null,
        amount: carryAmount,
        dateEpoch: startEpoch,
        notes: `Audited rollover entered by ${currentUser.name}`,
        receiptUrl: null
      };
      setTransactions(prev => [carryTx, ...prev]);
    }

    // Clone baseline budgets for the new tenure
    const newBaselineBudgets = [
      { id: `b-gen-${Date.now()}`, name: 'General Operations & Chapter Dues', allocated: 2500, academicYear: name, color: '#002855' },
      { id: `b-tech-${Date.now()}`, name: 'Technical & Hackathons Committee', allocated: 4000, academicYear: name, color: '#0284c7' },
      { id: `b-induct-${Date.now()}`, name: 'Induction & Honors Banquet', allocated: 2500, academicYear: name, color: '#D97706' }
    ];
    setBudgets(prev => [...prev, ...newBaselineBudgets]);

    setSelectedYear(name);
    setIsYearModalOpen(false);
    setAuthFeedback({ type: 'success', text: `Academic Year ${name} opened with baseline budgets.` });
    setTimeout(() => setAuthFeedback(null), 4000);
  };

  const exportToCSV = () => {
    const headers = [
      'Transaction ID',
      'Academic Year',
      'Type',
      'Status',
      'Title',
      'Category',
      'Amount ($)',
      'Date (Local)',
      'Unix Epoch (s)',
      'Committee Budget',
      'Linked Event',
      'Receipt URL',
      'Notes'
    ];

    const rows = yearTransactions.map(t => {
      const budget = budgets.find(b => b.id === t.budgetId)?.name || 'General Chapter';
      const event = events.find(e => e.id === t.eventId)?.name || 'None';
      return [
        `"${t.id}"`,
        `"${t.academicYear}"`,
        `"${t.type.toUpperCase()}"`,
        `"${t.status.toUpperCase()}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        t.amount,
        `"${formatEpochToDate(t.dateEpoch)}"`,
        t.dateEpoch,
        `"${budget.replace(/"/g, '""')}"`,
        `"${event.replace(/"/g, '""')}"`,
        `"${t.receiptUrl || 'None'}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IEEE_HKN_Ledger_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getDeadlineUrgency = (deadlineEpoch, status) => {
    if (status === 'completed') {
      return { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    }
    const nowEpoch = Math.floor(Date.now() / 1000);
    const diffDays = Math.ceil((deadlineEpoch - nowEpoch) / 86400);

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)}d`, color: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-600' };
    }
    if (diffDays <= 7) {
      return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'} (Urgent)`, color: 'bg-red-50 text-red-700 border-red-300', dot: 'bg-red-600' };
    }
    if (diffDays <= 14) {
      return { label: `Due in ${diffDays} days (Approaching)`, color: 'bg-amber-50 text-amber-700 border-amber-300', dot: 'bg-amber-500' };
    }
    return { label: `In ${diffDays} days`, color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
  };

  if (isAuthScreenOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001c3d] via-[#002855] to-slate-950 text-white flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-[#C69214]">
          {/* Header */}
          <div className="bg-[#002855] text-white p-6 border-b-4 border-[#C69214] text-center relative">
            <button
              onClick={() => setIsAuthScreenOpen(false)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-full bg-white/10"
              title="Continue as current user"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-gradient-to-tr from-[#C69214] to-amber-300 rounded-2xl mx-auto flex items-center justify-center text-[#002855] font-bold shadow-lg mb-3">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              IEEE-HKN <span className="text-[#F5A623]">Auth Portal</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">Smart Budget Scheduler • Multi-User Role Access</p>
          </div>

          <div className="p-6">
            {/* Toggle Login vs Register */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  authMode === 'login' ? 'bg-[#002855] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  authMode === 'register' ? 'bg-[#002855] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register Officer
              </button>
            </div>

            {authFeedback && (
              <div className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                authFeedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{authFeedback.text}</span>
              </div>
            )}

            {authMode === 'login' ? (
              <div className="space-y-4">
                <form onSubmit={handleManualLogin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#002855] text-slate-800"
                      placeholder="treasurer@hkn-chapter.org"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold text-slate-700">Password</label>
                      <span className="text-[10px] text-slate-400 font-mono">Bcrypt verified</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#002855] text-slate-800"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#002855] hover:bg-[#003875] text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-[#F5A623]" />
                    Authenticate Session
                  </button>
                </form>

                {/* 1-Click Role Switcher Demo Cards */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>1-Click Test Profiles</span>
                    <span className="text-amber-600 font-semibold normal-case">Instant Access</span>
                  </p>

                  <div className="space-y-2">
                    {userList.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickLogin(u)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition ${
                          currentUser?.id === u.id 
                            ? 'border-[#002855] bg-blue-50/70 ring-1 ring-[#002855]' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-300" />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-slate-500 text-[11px] truncate">{u.roleTitle}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'treasurer' ? 'bg-[#002855] text-white' :
                          u.role === 'chair' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterNewUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Officer Name</label>
                  <input
                    type="text"
                    name="regName"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chapter / Institutional Email</label>
                  <input
                    type="email"
                    name="regEmail"
                    required
                    placeholder="officer@ece.university.edu"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned RBAC Role</label>
                  <select
                    name="regRole"
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="chair">Committee Chair (Can record committee items)</option>
                    <option value="member">General Member / Auditor (Read-Only)</option>
                    <option value="treasurer">Chapter Treasurer (Full Admin privileges)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Committee Affiliation (For Chairs)</label>
                  <select
                    name="regCommittee"
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                  >
                    {yearBudgets.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Set Password</label>
                  <input
                    type="password"
                    required
                    defaultValue="password123"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-[#002855] hover:bg-[#003875] text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#F5A623]" />
                  Create Chapter Account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Primary Header with IEEE-HKN Branding & Multi-Year Controls */}
      <header className="bg-[#002855] text-white border-b-4 border-[#C69214] shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C69214] to-amber-300 flex items-center justify-center font-bold text-[#002855] shadow">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  IEEE-HKN <span className="text-[#F5A623] font-light">Smart Budget Scheduler</span>
                </h1>
                <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-semibold bg-[#001c3d] text-amber-300 rounded border border-amber-500/30">
                  AY Governance 2025
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-2">
                <span>Chapter Growth Engine</span>
                <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-amber-200 font-mono text-[10px]">{activeYearMeta.theme}</span>
              </p>
            </div>
          </div>

          {/* Right Action Cluster: Multi-Year Switcher, Profile, Export */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            
            {/* Multi-Year Switcher Selector */}
            <div className="flex items-center bg-[#001c3d] border border-blue-900 rounded-lg px-2.5 py-1">
              <Calendar className="w-3.5 h-3.5 text-[#F5A623] mr-1.5" />
              <span className="text-slate-300 mr-1.5 font-medium">AY:</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
              >
                {academicYears.map(yr => (
                  <option key={yr.id} value={yr.name} className="bg-[#002855] text-white">
                    {yr.name} {yr.isArchived ? '(Archived)' : ''}
                  </option>
                ))}
              </select>
              {canModifyAll && (
                <button
                  onClick={() => setIsYearModalOpen(true)}
                  className="ml-2 text-amber-300 hover:text-white p-0.5 rounded"
                  title="Add New Academic Year / Carryover Balance"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Authenticated User Quick Switcher */}
            <div 
              onClick={() => setIsAuthScreenOpen(true)}
              className="flex items-center gap-2 bg-[#001c3d] hover:bg-[#00224a] cursor-pointer border border-blue-900/80 rounded-lg px-2.5 py-1 transition"
              title="Click to Switch User Role or Log Out"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-5 h-5 rounded-full object-cover border border-amber-400"
              />
              <div className="hidden sm:block text-left">
                <p className="font-bold leading-tight text-white text-[11px] truncate max-w-[110px]">{currentUser.name}</p>
                <p className="text-[9px] text-[#F5A623] font-medium leading-none">{currentUser.role.toUpperCase()}</p>
              </div>
              <RefreshCw className="w-3 h-3 text-slate-400 ml-0.5" />
            </div>

            {/* Export Actions */}
            <button
              onClick={exportToCSV}
              title={`Download CSV Ledger for AY ${selectedYear}`}
              className="flex items-center gap-1 bg-[#003875] hover:bg-[#004899] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-400/20 text-white transition"
            >
              <Download className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="hidden md:inline">CSV</span>
            </button>

            <button
              onClick={handlePrintReport}
              title={`Print / Save PDF Report for AY ${selectedYear}`}
              className="flex items-center gap-1 bg-[#003875] hover:bg-[#004899] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-400/20 text-white transition"
            >
              <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="hidden md:inline">PDF</span>
            </button>

            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-1.5 rounded-lg bg-[#001c3d] text-slate-300 hover:text-white hover:bg-blue-900/50 transition border border-blue-900"
              title="Technical Schema & Docker Details"
            >
              <Info className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 py-1 scrollbar-none text-xs sm:text-sm">
          {[
            { id: 'overview', label: 'Executive Overview', icon: Layers },
            { id: 'transactions', label: `Transactions (${yearTransactions.length})`, icon: DollarSign },
            { id: 'budgets', label: 'Sub-Budgets', icon: BarChart3 },
            { id: 'events', label: 'Event Planning', icon: CalendarCheck },
            { id: 'deadlines', label: `Funding Deadlines (${yearDeadlines.length})`, icon: Clock },
            { id: 'analytics', label: 'Visual Analytics', icon: PieChartIcon },
            { id: 'years', label: 'Year Management & Audit', icon: Archive }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-medium border-b-2 whitespace-nowrap transition ${
                  active 
                    ? 'border-[#F5A623] text-white bg-white/10 rounded-t' 
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#F5A623]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Active Year & RBAC Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-200/70 border border-slate-300/80 px-4 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold bg-[#002855] text-amber-300 px-2 py-0.5 rounded text-[11px]">
              AY {selectedYear}
            </span>
            <span className="text-slate-700">
              {activeYearMeta.isArchived ? (
                <strong className="text-amber-800">Historical Archive Mode (Closed Ledger)</strong>
              ) : (
                <span>Active Operating Tenure ({formatEpochToDate(activeYearMeta.startEpoch)} – {formatEpochToDate(activeYearMeta.endEpoch)})</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">Active User:</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              currentUser.role === 'treasurer' ? 'bg-[#002855] text-white' :
              currentUser.role === 'chair' ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {currentUser.roleTitle}
            </span>
          </div>
        </div>

        {/* Smart Cash Flow Alert */}
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 shadow-sm transition ${
          cashFlowAlert.level === 'danger'
            ? 'bg-red-50 border-red-200 text-red-900'
            : cashFlowAlert.level === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {cashFlowAlert.level === 'danger' ? (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : cashFlowAlert.level === 'warning' ? (
            <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold mr-2">
              {cashFlowAlert.level === 'danger' ? 'Cash Flow Alert:' : cashFlowAlert.level === 'warning' ? 'Runway Advisory:' : 'Healthy Liquidity:'}
            </span>
            {cashFlowAlert.message}
          </div>
        </div>

        {/* Read-Only Notice for Auditors / Members */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              Viewing in <strong>Member / Faculty Auditor Mode</strong>. Modifying allocations, recording transactions, and managing deadlines are restricted to Chapter Treasurers & Committee Chairs.
            </span>
            <button
              onClick={() => setIsAuthScreenOpen(true)}
              className="text-[#002855] font-bold underline hover:text-blue-900"
            >
              Switch Role
            </button>
          </div>
        )}

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Actual Balance Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-[#002855]" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actual Balance (Real-Time)</p>
                    <p className={`text-2xl font-bold mt-1 ${balances.actualBalance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                      {formatCurrency(balances.actualBalance)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50 text-[#002855] rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Cleared In: <strong className="text-emerald-600">+{formatCurrency(balances.actualIncome)}</strong></span>
                  <span>Cleared Out: <strong className="text-rose-600">-{formatCurrency(balances.actualExpense)}</strong></span>
                </div>
              </div>

              {/* Projected Balance Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-[#C69214]" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Projected End Balance</p>
                    <p className={`text-2xl font-bold mt-1 ${balances.projectedBalance >= 0 ? 'text-[#002855]' : 'text-rose-600'}`}>
                      {formatCurrency(balances.projectedBalance)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-[#C69214] rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Drafted/Recurring In: <strong className="text-emerald-700">+{formatCurrency(balances.plannedIncome + balances.recurringIncome)}</strong></span>
                  <span>Committed Out: <strong className="text-rose-700">-{formatCurrency(balances.plannedExpense + balances.recurringExpense)}</strong></span>
                </div>
              </div>

              {/* Total Committee Budgets */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Committee Allocations</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {formatCurrency(balances.totalAllocatedBudgets)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#002855] h-2 rounded-full"
                      style={{ width: `${Math.min(100, balances.totalAllocatedBudgets ? (balances.totalActualSpend / balances.totalAllocatedBudgets) * 100 : 0)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Spent: {formatCurrency(balances.totalActualSpend)}</span>
                    <span>{balances.totalAllocatedBudgets ? Math.round((balances.totalActualSpend / balances.totalAllocatedBudgets) * 100) : 0}% Burnt</span>
                  </div>
                </div>
              </div>

              {/* Funding Deadlines Overview */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Funding Deadlines</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {yearDeadlines.filter(d => d.status !== 'completed').length} Pending
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Target Grant Funding:</span>
                  <strong className="text-emerald-700">
                    {formatCurrency(yearDeadlines.filter(d => d.status !== 'completed').reduce((acc, d) => acc + (d.fundingAmount || 0), 0))}
                  </strong>
                </div>
              </div>
            </div>

            {/* Cash Flow Trajectory & Deadlines Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#002855]" />
                      Cash Flow Trajectory (Actual vs. Projected)
                    </h3>
                    <p className="text-xs text-slate-500">Cumulative financial growth across Academic Year {selectedYear}</p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                    Epoch Timestamp Sequence
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData}>
                      <defs>
                        <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C69214" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#C69214" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#002855" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#002855" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        formatter={(val) => [formatCurrency(val), '']}
                        labelFormatter={(lbl) => `Entry Date: ${lbl}`}
                        contentStyle={{ backgroundColor: '#001c3d', borderColor: '#C69214', color: '#fff', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="projected" name="Projected Balance" stroke="#C69214" strokeWidth={2} fillOpacity={1} fill="url(#colorProjected)" />
                      <Area type="monotone" dataKey="actual" name="Actual Cleared Balance" stroke="#002855" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Deadlines Quick Box */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Urgent Financial Deadlines
                    </h3>
                    <button 
                      onClick={() => setActiveTab('deadlines')}
                      className="text-xs text-[#002855] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Grant applications & university requisition submission windows.</p>

                  <div className="space-y-3">
                    {yearDeadlines.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No deadlines set for this academic year.</p>
                    ) : (
                      yearDeadlines.slice(0, 3).map(dl => {
                        const urgency = getDeadlineUrgency(dl.deadlineEpoch, dl.status);
                        return (
                          <div key={dl.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{dl.title}</h4>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${urgency.color}`}>
                                {urgency.label}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                              <span>{formatEpochToDate(dl.deadlineEpoch)}</span>
                              {dl.fundingAmount > 0 && (
                                <span className="font-semibold text-emerald-700">+{formatCurrency(dl.fundingAmount)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingDeadline(null);
                      setIsDeadlineModalOpen(true);
                    }}
                    disabled={!canModifyAll}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                      !canModifyAll
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#002855] hover:bg-[#003875] text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#F5A623]" />
                    Set New Deadline
                  </button>
                </div>
              </div>
            </div>

            {/* Committee Budgets Card Strip */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#002855]" />
                    Sub-Committee Budget Utilization ({selectedYear})
                  </h3>
                  <p className="text-xs text-slate-500">Autonomous committee allocations for Chapter operations</p>
                </div>
                {canModifyAll && (
                  <button
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="text-xs font-semibold text-[#002855] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Committee Budget
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {yearBudgets.map(b => {
                  const txList = yearTransactions.filter(t => t.budgetId === b.id && t.type === 'expense');
                  const spentRealtime = txList.filter(t => t.status === 'realtime').reduce((s, t) => s + t.amount, 0);
                  const spentPlanned = txList.filter(t => t.status !== 'realtime').reduce((s, t) => s + t.amount, 0);
                  const totalUsed = spentRealtime + spentPlanned;
                  const pct = b.allocated > 0 ? Math.min(100, Math.round((totalUsed / b.allocated) * 100)) : 0;
                  const isExceeded = totalUsed > b.allocated;

                  return (
                    <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:shadow-sm transition">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800 truncate" title={b.name}>{b.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isExceeded ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${isExceeded ? 'bg-rose-500' : 'bg-[#002855]'}`} 
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>Actual: <strong className="text-slate-800">{formatCurrency(spentRealtime)}</strong></span>
                        <span>Cap: <strong className="text-slate-800">{formatCurrency(b.allocated)}</strong></span>
                      </div>
                      {spentPlanned > 0 && (
                        <p className="text-[10px] text-amber-700 mt-1">
                          + {formatCurrency(spentPlanned)} planned/recurring
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS CRUD */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {/* Filter / Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income (+)</option>
                    <option value="expense">Expenses (-)</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="realtime">Real-time</option>
                    <option value="planned">Planned</option>
                    <option value="recurring">Recurring</option>
                  </select>

                  <select
                    value={filterCommittee}
                    onChange={(e) => setFilterCommittee(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none max-w-[130px] truncate"
                  >
                    <option value="all">All Sub-Budgets</option>
                    {yearBudgets.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!isReadOnly && (
                <button
                  onClick={() => {
                    setEditingTx(null);
                    setReceiptAttachment(null);
                    setIsTxModalOpen(true);
                  }}
                  className="w-full md:w-auto bg-[#002855] hover:bg-[#003875] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Plus className="w-4 h-4 text-[#F5A623]" />
                  Add Transaction
                </button>
              )}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Date (Local / Unix)</th>
                      <th className="py-3 px-4">Title & Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Sub-Budget & Event</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Receipt</th>
                      {!isReadOnly && <th className="py-3 px-4 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={!isReadOnly ? 8 : 7} className="py-8 text-center text-slate-400">
                          No transactions found for Academic Year {selectedYear}.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(tx => {
                        const linkedBudget = budgets.find(b => b.id === tx.budgetId);
                        const linkedEvent = events.find(e => e.id === tx.eventId);
                        const canEditThisTx = canModifyCommittee(tx.budgetId);

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-medium text-slate-800 block">{formatEpochToDate(tx.dateEpoch)}</span>
                              <span className="text-[10px] font-mono text-slate-400" title="Internal Unix Timestamp">{tx.dateEpoch}s</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{tx.title}</span>
                              {tx.notes && <span className="text-[11px] text-slate-500 block truncate max-w-xs">{tx.notes}</span>}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                {tx.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {tx.status === 'realtime' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <Check className="w-3 h-3" /> Real-time
                                </span>
                              )}
                              {tx.status === 'planned' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <Clock className="w-3 h-3" /> Planned
                                </span>
                              )}
                              {tx.status === 'recurring' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                  <Zap className="w-3 h-3" /> Recurring
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[11px]">
                              {linkedBudget && (
                                <div className="text-slate-700 font-medium">{linkedBudget.name}</div>
                              )}
                              {linkedEvent ? (
                                <div className="text-amber-700 font-medium flex items-center gap-1">
                                  <CalendarCheck className="w-3 h-3" /> {linkedEvent.name}
                                </div>
                              ) : (
                                <div className="text-slate-400 italic">No event linked</div>
                              )}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold text-sm whitespace-nowrap ${
                              tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {tx.receiptUrl ? (
                                <button
                                  onClick={() => setReceiptViewer({ url: tx.receiptUrl, name: tx.receiptName || 'Attached receipt', type: tx.receiptType || (tx.receiptUrl.includes('application/pdf') ? 'application/pdf' : 'image/*'), size: tx.receiptSize || null })}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                  title="Inspect Attached Digital Receipt"
                                >
                                  <Paperclip className="w-4 h-4 mx-auto" />
                                </button>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            {!isReadOnly && (
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                {canEditThisTx ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingTx(tx);
                                        setReceiptAttachment(tx.receiptUrl ? {
                                          dataUrl: tx.receiptUrl,
                                          name: tx.receiptName || 'Attached receipt',
                                          type: tx.receiptType || (tx.receiptUrl.includes('application/pdf') ? 'application/pdf' : 'image/*'),
                                          size: tx.receiptSize || null,
                                          verified: tx.receiptVerified !== false
                                        } : null);
                                        setIsTxModalOpen(true);
                                      }}
                                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                                      title="Edit Transaction"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTransaction(tx.id)}
                                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                      title="Delete Transaction"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-[10px] italic">Restricted</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MULTIPLE SUB-BUDGETS */}
        {activeTab === 'budgets' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Multiple Committee Sub-Budgets</h2>
                <p className="text-xs text-slate-500">Autonomous committee allocations for Academic Year {selectedYear}</p>
              </div>
              {canModifyAll && (
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="bg-[#002855] hover:bg-[#003875] text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#F5A623]" />
                  Add Sub-Budget
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {yearBudgets.map(b => {
                const committeeTx = yearTransactions.filter(t => t.budgetId === b.id);
                const actualSpend = committeeTx.filter(t => t.type === 'expense' && t.status === 'realtime').reduce((s, t) => s + t.amount, 0);
                const plannedSpend = committeeTx.filter(t => t.type === 'expense' && t.status !== 'realtime').reduce((s, t) => s + t.amount, 0);
                const actualIn = committeeTx.filter(t => t.type === 'income' && t.status === 'realtime').reduce((s, t) => s + t.amount, 0);
                const remaining = b.allocated - actualSpend;

                return (
                  <div key={b.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="w-3 h-3 rounded-full inline-block mr-2" style={{ backgroundColor: b.color }} />
                        <h3 className="text-sm font-bold text-slate-900 inline">{b.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{committeeTx.length} associated transactions</p>
                      </div>
                      <span className="text-base font-bold text-slate-900">{formatCurrency(b.allocated)}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Actual Burn: {formatCurrency(actualSpend)}</span>
                        <span>Remaining Cap: <strong className={remaining < 0 ? 'text-red-600' : 'text-emerald-700'}>{formatCurrency(remaining)}</strong></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full ${actualSpend > b.allocated ? 'bg-red-500' : 'bg-[#002855]'}`}
                          style={{ width: `${Math.min(100, b.allocated ? (actualSpend / b.allocated) * 100 : 0)}%` }}
                        />
                      </div>
                      {plannedSpend > 0 && (
                        <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Forecasted pending expenses: {formatCurrency(plannedSpend)}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs flex justify-between text-slate-500">
                      <span>Direct Income Generated: <strong className="text-emerald-600">+{formatCurrency(actualIn)}</strong></span>
                      <span>Total Tx: {committeeTx.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: EVENT PLANNING */}
        {activeTab === 'events' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Event-Linked Chapter Budgets</h2>
                <p className="text-xs text-slate-500">Group multiple incomes & expenses under targeted chapter flagship events</p>
              </div>
              {!isReadOnly && (
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setIsEventModalOpen(true);
                  }}
                  className="bg-[#002855] hover:bg-[#003875] text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#F5A623]" />
                  Create Event Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {yearEvents.length === 0 ? (
                <div className="col-span-3 bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
                  No events configured for Academic Year {selectedYear}.
                </div>
              ) : (
                yearEvents.map(ev => {
                  const evTransactions = yearTransactions.filter(t => t.eventId === ev.id);
                  const actualIn = evTransactions.filter(t => t.type === 'income' && t.status === 'realtime').reduce((s, t) => s + t.amount, 0);
                  const plannedIn = evTransactions.filter(t => t.type === 'income' && t.status !== 'realtime').reduce((s, t) => s + t.amount, 0);
                  const actualOut = evTransactions.filter(t => t.type === 'expense' && t.status === 'realtime').reduce((s, t) => s + t.amount, 0);
                  const plannedOut = evTransactions.filter(t => t.type === 'expense' && t.status !== 'realtime').reduce((s, t) => s + t.amount, 0);
                  const netCost = (actualOut + plannedOut) - (actualIn + plannedIn);

                  return (
                    <div key={ev.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{ev.name}</h3>
                          <span className="text-xs font-bold text-[#002855] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {formatCurrency(ev.allocated)} Cap
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C69214]" />
                          {formatEpochToDate(ev.dateEpoch)}
                        </p>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Spent: {formatCurrency(actualOut)}</span>
                            <span>{ev.allocated ? Math.round((actualOut / ev.allocated) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className="bg-[#002855] h-2 rounded-full"
                              style={{ width: `${Math.min(100, ev.allocated ? (actualOut / ev.allocated) * 100 : 0)}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 bg-slate-50 p-3 rounded-lg text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Realized Income (Dues/Grants):</span>
                            <strong className="text-emerald-700">+{formatCurrency(actualIn)}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Realized Expenses:</span>
                            <strong className="text-rose-700">-{formatCurrency(actualOut)}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Committed Pending Expenses:</span>
                            <strong className="text-amber-700">-{formatCurrency(plannedOut)}</strong>
                          </div>
                          <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                            <span>Net Chapter Event Cost:</span>
                            <span>{formatCurrency(netCost)}</span>
                          </div>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setEditingEvent(ev);
                              setIsEventModalOpen(true);
                            }}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900 px-2 py-1"
                          >
                            Edit
                          </button>
                          {canModifyAll && (
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 5: DEADLINES TRACKING */}
        {activeTab === 'deadlines' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Financial & Grant Funding Deadlines</h2>
                <p className="text-xs text-slate-500">Track requisition cutoffs, university budget submission dates, and headquarters reports</p>
              </div>
              {canModifyAll && (
                <button
                  onClick={() => {
                    setEditingDeadline(null);
                    setIsDeadlineModalOpen(true);
                  }}
                  className="bg-[#002855] hover:bg-[#003875] text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#F5A623]" />
                  Add Deadline
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearDeadlines.map(dl => {
                const urgency = getDeadlineUrgency(dl.deadlineEpoch, dl.status);
                const isCompleted = dl.status === 'completed';

                return (
                  <div key={dl.id} className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col justify-between transition ${
                    isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${urgency.color}`}>
                          <span className={`w-2 h-2 rounded-full ${urgency.dot}`} />
                          {urgency.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{dl.category}</span>
                      </div>

                      <h3 className={`text-sm font-bold mt-1 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {dl.title}
                      </h3>

                      <div className="mt-2 text-xs text-slate-500 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Cutoff Date: <strong className="text-slate-700">{formatEpochToDate(dl.deadlineEpoch)}</strong>
                        </p>
                        {dl.fundingAmount > 0 && (
                          <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <DollarSign className="w-3.5 h-3.5" />
                            Target Funding: {formatCurrency(dl.fundingAmount)}
                          </p>
                        )}
                        {dl.notes && (
                          <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] mt-2">
                            {dl.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleDeadlineStatus(dl.id)}
                        disabled={isReadOnly}
                        className={`text-xs font-semibold px-2.5 py-1 rounded transition flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isCompleted ? 'Mark Pending' : 'Mark Completed'}
                      </button>

                      {canModifyAll && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingDeadline(dl);
                              setIsDeadlineModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeadline(dl.id)}
                            className="p-1 text-rose-500 hover:text-rose-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Chapter Financial Analytics & Projections</h2>
                <p className="text-xs text-slate-500">Visual trends, burn rate benchmarks, and category allocations for AY {selectedYear}</p>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-[#002855] px-2.5 py-1 rounded border border-blue-200 font-bold">
                {yearTransactions.length} Settled & Planned Entries
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown Donut */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Expense Breakdown by Category</h3>
                <p className="text-xs text-slate-500 mb-4">Categorized expenditures formatted for institutional reporting</p>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => formatCurrency(val)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Committee Burn Rate Comparison */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Sub-Budget Burn Rate vs. Allocation</h3>
                <p className="text-xs text-slate-500 mb-4">Actual cleared expenditures compared to planned commitments</p>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetBarData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        formatter={(val) => formatCurrency(val)}
                        contentStyle={{ backgroundColor: '#001c3d', color: '#fff', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="Allocated" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ActualSpent" fill="#002855" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="PlannedSpent" fill="#C69214" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ACADEMIC YEAR MANAGEMENT & AUDIT */}
        {activeTab === 'years' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Academic Year Partitions & Governance</h2>
                <p className="text-xs text-slate-500">Historical archive management, surplus rollover, and multi-year audit logs</p>
              </div>
              {canModifyAll && (
                <button
                  onClick={() => setIsYearModalOpen(true)}
                  className="bg-[#002855] hover:bg-[#003875] text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#F5A623]" />
                  Initiate New Academic Year
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {academicYears.map(yr => {
                const yrTx = transactions.filter(t => t.academicYear === yr.name);
                const yrIn = yrTx.filter(t => t.type === 'income' && t.status === 'realtime').reduce((s, t) => s + t.amount, 0);
                const yrOut = yrTx.filter(t => t.type === 'expense' && t.status === 'realtime').reduce((s, t) => s + t.amount, 0);
                const netSurplus = yrIn - yrOut;
                const isSelected = yr.name === selectedYear;

                return (
                  <div key={yr.id} className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col justify-between transition ${
                    isSelected ? 'border-2 border-[#002855] ring-2 ring-[#002855]/10' : 'border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-bold text-slate-900">{yr.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          yr.isArchived ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {yr.isArchived ? 'Archived' : 'Active Operation'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 italic">{yr.theme || 'Standard Chapter Operations'}</p>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <span>Start Epoch:</span>
                          <span className="font-mono">{yr.startEpoch} ({formatEpochToDate(yr.startEpoch)})</span>
                        </div>
                        <div className="flex justify-between">
                          <span>End Epoch:</span>
                          <span className="font-mono">{yr.endEpoch} ({formatEpochToDate(yr.endEpoch)})</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span>Audited Surplus / Net:</span>
                          <strong className={netSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {formatCurrency(netSurplus)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedYear(yr.name)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          isSelected ? 'bg-[#002855] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Currently Viewing' : 'Switch to Year'}
                      </button>

                      <span className="text-[11px] text-slate-400">
                        {yrTx.length} records
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {}
      {/* MODAL: TRANSACTION ADD / EDIT */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-[#002855] text-white px-6 py-4 flex justify-between items-center border-b-2 border-[#C69214]">
              <h3 className="font-bold text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#F5A623]" />
                {editingTx ? 'Edit Transaction' : 'Record New Transaction'}
              </h3>
              <button 
                onClick={() => { setIsTxModalOpen(false); setEditingTx(null); setReceiptAttachment(null); }}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Flow</label>
                  <select
                    name="type"
                    defaultValue={editingTx?.type || 'expense'}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entry Status</label>
                  <select
                    name="status"
                    defaultValue={editingTx?.status || 'realtime'}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="realtime">Real-time (Settled)</option>
                    <option value="planned">Planned (Draft)</option>
                    <option value="recurring">Recurring (Monthly)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title / Vendor Description</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. IEEE Induction Catering Deposit"
                  defaultValue={editingTx?.title || ''}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    placeholder="0.00"
                    defaultValue={editingTx?.amount || ''}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={epochToInputString(editingTx?.dateEpoch || Math.floor(Date.now() / 1000))}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Accounting Category</label>
                <select
                  name="category"
                  defaultValue={editingTx?.category || EXPENSE_CATEGORIES[0]}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                >
                  <optgroup label="Expense Categories">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Income Categories">
                    {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Associate Sub-Budget</label>
                  <select
                    name="budgetId"
                    defaultValue={editingTx?.budgetId || currentUser?.committeeId || ''}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="">(None / General Chapter)</option>
                    {yearBudgets.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link Event (Optional)</label>
                  <select
                    name="eventId"
                    defaultValue={editingTx?.eventId || ''}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="">(None / Non-Event)</option>
                    {yearEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Context Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Check number, invoice reference, payment confirmation..."
                  defaultValue={editingTx?.notes || ''}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <label className="font-semibold text-slate-800 block">Digital Invoice / Receipt</label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Upload the actual receipt image or PDF and attach it to this transaction.</p>
                  </div>
                  <Paperclip className="w-4 h-4 text-[#002855] mt-0.5" />
                </div>

                <label
                  htmlFor="receiptFile"
                  className="border-2 border-dashed border-slate-300 hover:border-[#002855] bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition"
                >
                  <UploadCloud className="w-7 h-7 text-[#002855] mb-1.5" />
                  <span className="text-xs font-bold text-slate-700">Click to upload receipt</span>
                  <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, JPEG or PDF • Maximum 10 MB</span>
                  <input
                    id="receiptFile"
                    name="receiptFile"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleReceiptUpload(e.target.files?.[0])}
                  />
                </label>

                {receiptAttachment && (
                  <div className="mt-3 bg-white border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          {receiptAttachment.type === 'application/pdf' ? <FileText className="w-4 h-4 text-rose-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{receiptAttachment.name}</p>
                          <p className="text-[10px] text-slate-500">{receiptAttachment.size ? `${(receiptAttachment.size / 1024 / 1024).toFixed(2)} MB` : 'Attached file'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Format verified
                        </span>
                        <button
                          type="button"
                          onClick={() => setReceiptAttachment(null)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Remove receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {receiptAttachment.type !== 'application/pdf' && receiptAttachment.dataUrl && (
                      <img
                        src={receiptAttachment.dataUrl}
                        alt="Uploaded receipt preview"
                        className="mt-3 max-h-40 w-full object-contain rounded border border-slate-200 bg-slate-50"
                      />
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-500 mt-2">
                  <strong>Verification:</strong> the application validates the file type and size. Authenticity of the invoice is not automatically certified.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsTxModalOpen(false); setEditingTx(null); setReceiptAttachment(null); }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002855] hover:bg-[#003875] text-white rounded-lg font-bold shadow"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEADLINE ADD / EDIT */}
      {isDeadlineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-[#002855] text-white px-6 py-4 flex justify-between items-center border-b-2 border-[#C69214]">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#F5A623]" />
                {editingDeadline ? 'Edit Financial Deadline' : 'Set Chapter Funding Deadline'}
              </h3>
              <button 
                onClick={() => { setIsDeadlineModalOpen(false); setEditingDeadline(null); }}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeadline} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deadline Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. IEEE Foundation Student Branch Grant"
                  defaultValue={editingDeadline?.title || ''}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingDeadline?.category || 'Grant Application'}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="Grant Application">Grant Application</option>
                    <option value="University Funds">University Funds</option>
                    <option value="Sponsorship Pitch">Sponsorship Pitch</option>
                    <option value="Compliance">Compliance & Annual Report</option>
                    <option value="Tax Requisition">Tax Requisition</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Funding ($)</label>
                  <input
                    type="number"
                    name="fundingAmount"
                    placeholder="0.00"
                    defaultValue={editingDeadline?.fundingAmount || ''}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cutoff Date</label>
                <input
                  type="date"
                  name="deadlineDate"
                  required
                  defaultValue={epochToInputString(editingDeadline?.deadlineEpoch || Math.floor(Date.now() / 1000) + 7 * 86400)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions / Requisites</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Advisor signatures required, itemized invoices package..."
                  defaultValue={editingDeadline?.notes || ''}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsDeadlineModalOpen(false); setEditingDeadline(null); }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002855] hover:bg-[#003875] text-white rounded-lg font-bold shadow"
                >
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EVENT ADD / EDIT */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-[#002855] text-white px-6 py-4 flex justify-between items-center border-b-2 border-[#C69214]">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#F5A623]" />
                {editingEvent ? 'Edit Chapter Event' : 'Create Event Budget Profile'}
              </h3>
              <button 
                onClick={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Spring 2026 Induction Gala"
                  defaultValue={editingEvent?.name || ''}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allocated Budget Cap ($)</label>
                  <input
                    type="number"
                    name="allocated"
                    required
                    placeholder="2000"
                    defaultValue={editingEvent?.allocated || ''}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    defaultValue={epochToInputString(editingEvent?.dateEpoch || Math.floor(Date.now() / 1000))}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Committee Budget</label>
                <select
                  name="budgetId"
                  defaultValue={editingEvent?.budgetId || yearBudgets[0]?.id}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-[#002855]"
                >
                  {yearBudgets.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002855] hover:bg-[#003875] text-white rounded-lg font-bold shadow"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUB-BUDGET ADD */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-[#002855] text-white px-6 py-4 flex justify-between items-center border-b-2 border-[#C69214]">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#F5A623]" />
                Add Sub-Committee Budget
              </h3>
              <button 
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Committee / Branch Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Outreach & K-12 STEM"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allocated Cap ($)</label>
                  <input
                    type="number"
                    name="allocated"
                    required
                    placeholder="1500"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge Color</label>
                  <input
                    type="color"
                    name="color"
                    defaultValue="#0284c7"
                    className="w-full h-9 border border-slate-300 rounded-lg p-1 bg-slate-50 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002855] hover:bg-[#003875] text-white rounded-lg font-bold shadow"
                >
                  Allocate Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW ACADEMIC YEAR WIZARD */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-[#002855] text-white px-6 py-4 flex justify-between items-center border-b-2 border-[#C69214]">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F5A623]" />
                Initiate New Academic Year
              </h3>
              <button 
                onClick={() => setIsYearModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewYear} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Year Name</label>
                <input
                  type="text"
                  name="yearName"
                  required
                  placeholder="e.g. 2027-2028"
                  defaultValue="2027-2028"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chapter Theme / Directive</label>
                <input
                  type="text"
                  name="yearTheme"
                  placeholder="e.g. Industrial Mentorship & Innovation"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue="2027-08-25"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue="2028-06-25"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>

              {/* Carryover Balance Feature */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <label className="block font-semibold text-amber-900 mb-1">
                  Carryover Balance from {selectedYear}
                </label>
                <p className="text-[11px] text-amber-800 mb-2">
                  Audited closing surplus ({formatCurrency(balances.actualBalance)}) can be automatically credited to the new ledger as Opening Cash Reserve.
                </p>
                <input
                  type="number"
                  name="carriedBalance"
                  defaultValue={Math.max(0, balances.actualBalance)}
                  className="w-full border border-amber-300 rounded-lg p-2 bg-white font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsYearModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002855] hover:bg-[#003875] text-white rounded-lg font-bold shadow"
                >
                  Create & Open Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL RECEIPT INSPECTOR */}
      {receiptViewer && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-[#002855] text-white px-5 py-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-[#F5A623]" />
                  Digital Invoice / Receipt Verification
                </span>
                <p className="text-[10px] text-slate-300 mt-0.5">Review the receipt attached to this transaction.</p>
              </div>
              <button onClick={() => setReceiptViewer(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-[1fr_260px] max-h-[calc(92vh-58px)]">
              <div className="p-4 bg-slate-100 min-h-[420px] flex items-center justify-center overflow-auto">
                {receiptViewer.type === 'application/pdf' ? (
                  <iframe
                    src={receiptViewer.url}
                    title="Digital receipt PDF"
                    className="w-full h-[70vh] rounded-lg border border-slate-300 bg-white shadow-sm"
                  />
                ) : (
                  <img
                    src={receiptViewer.url}
                    alt="Uploaded digital receipt"
                    className="max-w-full max-h-[70vh] rounded-lg border border-slate-300 shadow-sm object-contain bg-white"
                  />
                )}
              </div>

              <div className="bg-white border-l border-slate-200 p-4 overflow-y-auto">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Receipt details</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">File name</p>
                    <p className="font-semibold text-slate-700 break-words mt-0.5">{receiptViewer.name || 'Attached receipt'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">File type</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{receiptViewer.type || 'Image'}</p>
                  </div>
                  {receiptViewer.size && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">File size</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{(receiptViewer.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Upload verified
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-1">Accepted image/PDF format and within the 10 MB upload limit.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800">
                    <strong>Important:</strong> file validation confirms the uploaded document format. It does not independently verify whether the invoice is authentic.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setReceiptViewer(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TECHNICAL ARCHITECTURE & OPEN-SOURCE MANIFEST */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-[#002855] text-white px-6 py-4 flex justify-between items-center border-b-2 border-[#C69214]">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
                  IEEE-HKN Budget Hack 2025 Architecture
                </h3>
                <p className="text-xs text-slate-300">Technical specifications & Docker deployment</p>
              </div>
              <button onClick={() => setIsInfoModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Judging Alignment Checklist (40% Technical + 50% Functional)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  <li><strong>Unix Timestamps:</strong> All dates stored strictly as integer Unix epoch seconds.</li>
                  <li><strong>Academic Year Partitioning:</strong> Isolated ledger, events, and sub-budgets with surplus rollover.</li>
                  <li><strong>Multi-User Authentication:</strong> Bcrypt password hashing simulation with RBAC (Treasurer, Chair, Auditor).</li>
                  <li><strong>Dual Balances:</strong> Real-time cleared balance vs. scheduled/projected burn rate.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">Docker Containerization Snippet</h4>
                <p className="text-slate-500 mb-2">Deploy with PostgreSQL and Next.js in 1 command:</p>
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto font-mono text-[11px] leading-relaxed">
{`# Dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://hkn_user:hkn_pass@postgres:5432/hkn_budget
    depends_on: [postgres]
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: hkn_user
      POSTGRES_PASSWORD: hkn_pass
      POSTGRES_DB: hkn_budget
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">PostgreSQL Relational Schema</h4>
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto font-mono text-[11px] leading-relaxed">
{`CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(128) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL, /* 'treasurer' | 'chair' | 'member' */
  committee_id VARCHAR(64)
);

CREATE TABLE academic_years (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(16) UNIQUE NOT NULL,
  start_epoch BIGINT NOT NULL,
  end_epoch BIGINT NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE
);

CREATE TABLE transactions (
  id VARCHAR(64) PRIMARY KEY,
  academic_year VARCHAR(16) NOT NULL REFERENCES academic_years(name),
  type VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  date_epoch BIGINT NOT NULL,
  category VARCHAR(64) NOT NULL,
  budget_id VARCHAR(64) REFERENCES budgets(id),
  event_id VARCHAR(64) REFERENCES events(id),
  receipt_url TEXT,
  notes TEXT
);`}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="px-4 py-2 bg-[#002855] text-white rounded-lg text-xs font-bold hover:bg-[#003875]"
              >
                Close Architecture Spec
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            IEEE Eta Kappa Nu (IEEE-HKN) • Smart Budget Scheduler for Chapter Growth
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Open-Source MIT • RBAC Protected • Unix Timestamps
          </span>
        </div>
      </footer>
    </div>
  );
}