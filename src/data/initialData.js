// Seed/demo data extracted from the original application.

export const SEEDED_USERS = [
  {
    id: 'u-1',
    name: 'Elena Rostova',
    email: 'treasurer@hkn-chapter.org',
    role: 'treasurer', // 'treasurer' (Admin), 'chair' (Committee Chair), 'member' (Auditor)
    roleTitle: 'Chapter Treasurer (Admin)',
    committeeId: null,
    passwordHash: '$2a$12$e8YF/r7X9mR7xOq.VbL6w.sampleTreasurerHashedPass2025',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    joinedYear: '2024'
  },
  {
    id: 'u-2',
    name: 'Marcus Chen',
    email: 'tech-chair@hkn-chapter.org',
    role: 'chair',
    roleTitle: 'Technical Committee Chair',
    committeeId: 'b-tech',
    passwordHash: '$2a$12$p3QW/k9Y2mR7xOq.VbL6w.sampleChairHashedPass2025',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    joinedYear: '2025'
  },
  {
    id: 'u-3',
    name: 'Prof. David Vance',
    email: 'advisor@ece.university.edu',
    role: 'member',
    roleTitle: 'Faculty Advisor & Auditor',
    committeeId: null,
    passwordHash: '$2a$12$k8LW/m2X4mR7xOq.VbL6w.sampleAdvisorHashedPass2025',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    joinedYear: '2023'
  }
];

export const INITIAL_ACADEMIC_YEARS = [
  {
    id: 'ay-2024',
    name: '2024-2025',
    startEpoch: 1724544000, // Aug 25, 2024
    endEpoch: 1750896000,   // June 26, 2025
    isArchived: true,
    carriedBalance: 1250,
    theme: 'Foundational Renewal & Lab Growth'
  },
  {
    id: 'ay-2025',
    name: '2025-2026',
    startEpoch: 1756080000, // Aug 25, 2025
    endEpoch: 1782432000,   // June 26, 2026
    isArchived: false,
    carriedBalance: 2420,
    theme: 'Flagship IEEE Hackathon & STEM Outreach'
  },
  {
    id: 'ay-2026',
    name: '2026-2027',
    startEpoch: 1787616000, // Aug 25, 2026
    endEpoch: 1813968000,   // June 26, 2027
    isArchived: false,
    carriedBalance: 0,
    theme: 'Centennial Chapter Expansion'
  }
];

export const INCOME_CATEGORIES = [
  'University / Dept Funds',
  'IEEE Region / Section Grants',
  'Corporate Sponsors',
  'Member Initiation Dues',
  'Fundraising & Merch Sales',
  'Surplus Carryover'
];

export const EXPENSE_CATEGORIES = [
  'Induction Banquet & Regalia',
  'Hardware & Hackathon Kits',
  'Food & Refreshments',
  'Speaker Honorariums & Travel',
  'Workshops & Tutoring Supplies',
  'Marketing & Promotional Items',
  'Administrative & IEEE Fees'
];

export const INITIAL_BUDGETS = [
  // 2025-2026
  { id: 'b-gen', name: 'General Operations & Chapter Dues', allocated: 2600, academicYear: '2025-2026', color: '#002855' },
  { id: 'b-tech', name: 'Technical & Hackathons Committee', allocated: 4200, academicYear: '2025-2026', color: '#0284c7' },
  { id: 'b-induct', name: 'Induction & Honors Banquet', allocated: 2800, academicYear: '2025-2026', color: '#D97706' },
  { id: 'b-outreach', name: 'Tutoring & STEM High School Outreach', allocated: 1400, academicYear: '2025-2026', color: '#059669' },

  // 2024-2025 (Historical)
  { id: 'b-gen-24', name: 'General Operations & Chapter Dues', allocated: 2000, academicYear: '2024-2025', color: '#002855' },
  { id: 'b-tech-24', name: 'Technical Projects & Lab Upgrades', allocated: 3100, academicYear: '2024-2025', color: '#0284c7' },
  { id: 'b-induct-24', name: 'Annual Induction Dinner', allocated: 2200, academicYear: '2024-2025', color: '#D97706' },

  // 2026-2027 (Future Planning)
  { id: 'b-gen-26', name: 'General Operations & Reserve', allocated: 3000, academicYear: '2026-2027', color: '#002855' },
  { id: 'b-tech-26', name: 'Mega Hackathon & Robocon Team', allocated: 5500, academicYear: '2026-2027', color: '#0284c7' },
  { id: 'b-induct-26', name: 'Centennial Induction Banquet', allocated: 3500, academicYear: '2026-2027', color: '#D97706' }
];

export const INITIAL_EVENTS = [
  // 2025-2026
  { id: 'ev-1', name: 'Fall 2025 Induction & Regalia Ceremony', budgetId: 'b-induct', allocated: 2200, academicYear: '2025-2026', dateEpoch: 1763136000 },
  { id: 'ev-2', name: 'IEEE Regional Hardware Hackathon 2025', budgetId: 'b-tech', allocated: 3500, academicYear: '2025-2026', dateEpoch: 1761840000 },
  { id: 'ev-3', name: 'ECE Peer Tutoring & Exam Prep Jam', budgetId: 'b-outreach', allocated: 600, academicYear: '2025-2026', dateEpoch: 1759248000 },

  // 2024-2025 (Historical)
  { id: 'ev-24-1', name: 'Spring 2025 Induction Banquet', budgetId: 'b-induct-24', allocated: 2100, academicYear: '2024-2025', dateEpoch: 1745510400 },
  { id: 'ev-24-2', name: 'PCB Layout Bootcamp & Microcontroller Day', budgetId: 'b-tech-24', allocated: 1500, academicYear: '2024-2025', dateEpoch: 1731600000 },

  // 2026-2027
  { id: 'ev-26-1', name: 'Fall 2026 IEEE Global HackSprint', budgetId: 'b-tech-26', allocated: 4500, academicYear: '2026-2027', dateEpoch: 1793289600 }
];

export const INITIAL_DEADLINES = [
  // 2025-2026
  {
    id: 'dl-1',
    title: 'IEEE Region 3 Student Activity Grant Application',
    category: 'Grant Application',
    academicYear: '2025-2026',
    deadlineEpoch: Math.floor(Date.now() / 1000) + (5 * 86400), // 5 days from now
    status: 'pending',
    fundingAmount: 1500,
    notes: 'Requires chapter annual activity proposal and faculty advisor signature.'
  },
  {
    id: 'dl-2',
    title: 'SGA University Student Government Fall Requisition',
    category: 'University Funds',
    academicYear: '2025-2026',
    deadlineEpoch: Math.floor(Date.now() / 1000) + (11 * 86400), // 11 days from now
    status: 'pending',
    fundingAmount: 2500,
    notes: 'Submit vendor quotes for banquet hall and soldering safety equipment.'
  },
  {
    id: 'dl-3',
    title: 'IEEE-HKN Outstanding Chapter Award Final Dossier',
    category: 'Compliance',
    academicYear: '2025-2026',
    deadlineEpoch: Math.floor(Date.now() / 1000) + (42 * 86400),
    status: 'pending',
    fundingAmount: 0,
    notes: 'Submit audited balance sheet and service hours catalog to IEEE Headquarters.'
  },

  // 2024-2025
  {
    id: 'dl-24-1',
    title: 'Spring 2025 University Discretionary Funding Form',
    category: 'University Funds',
    academicYear: '2024-2025',
    deadlineEpoch: 1740787200,
    status: 'completed',
    fundingAmount: 1800,
    notes: 'Approved and deposited into chapter checking account.'
  },

  // 2026-2027
  {
    id: 'dl-26-1',
    title: 'Centennial Endowment Grant Initial Application',
    category: 'Grant Application',
    academicYear: '2026-2027',
    deadlineEpoch: 1790467200,
    status: 'pending',
    fundingAmount: 5000,
    notes: 'Advance corporate matching endowment proposal.'
  }
];

export const INITIAL_TRANSACTIONS = [
  // 2025-2026
  {
    id: 'tx-1',
    academicYear: '2025-2026',
    type: 'income',
    status: 'realtime',
    title: 'ECE Department Annual Support Allotment',
    category: 'University / Dept Funds',
    budgetId: 'b-gen',
    eventId: null,
    amount: 3200,
    dateEpoch: 1756819200,
    notes: 'Direct institutional transfer from Dean of Engineering office',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'tx-carry-25',
    academicYear: '2025-2026',
    type: 'income',
    status: 'realtime',
    title: 'Surplus Carryover from AY 2024-2025',
    category: 'Surplus Carryover',
    budgetId: 'b-gen',
    eventId: null,
    amount: 2420,
    dateEpoch: 1756080000,
    notes: 'Audited net surplus rolled forward by Chapter Treasurer',
    receiptUrl: null
  },
  {
    id: 'tx-2',
    academicYear: '2025-2026',
    type: 'income',
    status: 'realtime',
    title: 'Fall 2025 Initiate Candidate Fees (20 Inductees)',
    category: 'Member Initiation Dues',
    budgetId: 'b-induct',
    eventId: 'ev-1',
    amount: 1600,
    dateEpoch: 1758028800,
    notes: '$80/candidate local & national portion collected via Stripe',
    receiptUrl: null
  },
  {
    id: 'tx-3',
    academicYear: '2025-2026',
    type: 'expense',
    status: 'realtime',
    title: 'Banquet Hall Deposit & Reservation Fee',
    category: 'Induction Banquet & Regalia',
    budgetId: 'b-induct',
    eventId: 'ev-1',
    amount: 850,
    dateEpoch: 1758547200,
    notes: 'Faculty Club Gold Room reservation deposit (50% upfront)',
    receiptUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'tx-4',
    academicYear: '2025-2026',
    type: 'expense',
    status: 'realtime',
    title: 'Soldering Stations & Microcontroller Kits',
    category: 'Hardware & Hackathon Kits',
    budgetId: 'b-tech',
    eventId: 'ev-2',
    amount: 1250,
    dateEpoch: 1759584000,
    notes: '15x ESP32 S3 dev boards, multi-meters, lead-free solder wire',
    receiptUrl: null
  },
  {
    id: 'tx-5',
    academicYear: '2025-2026',
    type: 'expense',
    status: 'recurring',
    title: 'IEEE Student Branch Cloud Host & Domain Registry',
    category: 'Administrative & IEEE Fees',
    budgetId: 'b-gen',
    eventId: null,
    amount: 55,
    dateEpoch: 1759238400,
    notes: 'Monthly AWS server slice + GitHub chapter org seats',
    receiptUrl: null
  },
  {
    id: 'tx-6',
    academicYear: '2025-2026',
    type: 'income',
    status: 'planned',
    title: 'Lockheed Martin Hackathon Gold Sponsorship',
    category: 'Corporate Sponsors',
    budgetId: 'b-tech',
    eventId: 'ev-2',
    amount: 2500,
    dateEpoch: 1761052800,
    notes: 'Pledged agreement signed. Awaiting university vendor clearance voucher',
    receiptUrl: null
  },
  {
    id: 'tx-7',
    academicYear: '2025-2026',
    type: 'expense',
    status: 'planned',
    title: 'Catering & Dinner Buffet for 60 Attendees',
    category: 'Food & Refreshments',
    budgetId: 'b-induct',
    eventId: 'ev-1',
    amount: 1450,
    dateEpoch: 1763136000,
    notes: 'Final banquet dinner quote locked with Campus Dining Services',
    receiptUrl: null
  },
  {
    id: 'tx-8',
    academicYear: '2025-2026',
    type: 'expense',
    status: 'planned',
    title: 'Hackathon Prize Hardware & Laser Cut Plaques',
    category: 'Hardware & Hackathon Kits',
    budgetId: 'b-tech',
    eventId: 'ev-2',
    amount: 1300,
    dateEpoch: 1761926400,
    notes: '1st, 2nd, and 3rd place prizes and custom HKN insignia awards',
    receiptUrl: null
  },

  // 2024-2025 (Historical closed year)
  {
    id: 'tx-24-1',
    academicYear: '2024-2025',
    type: 'income',
    status: 'realtime',
    title: 'ECE Department Annual Support 2024',
    category: 'University / Dept Funds',
    budgetId: 'b-gen-24',
    eventId: null,
    amount: 2800,
    dateEpoch: 1724630400,
    notes: 'Department baseline allotment',
    receiptUrl: null
  },
  {
    id: 'tx-24-2',
    academicYear: '2024-2025',
    type: 'income',
    status: 'realtime',
    title: 'Spring Banquet Ticket Sales & Dues',
    category: 'Member Initiation Dues',
    budgetId: 'b-induct-24',
    eventId: 'ev-24-1',
    amount: 2150,
    dateEpoch: 1744329600,
    notes: 'Collected from 24 initiates and guests',
    receiptUrl: null
  },
  {
    id: 'tx-24-3',
    academicYear: '2024-2025',
    type: 'expense',
    status: 'realtime',
    title: 'Banquet Hall & Catering 2025',
    category: 'Induction Banquet & Regalia',
    budgetId: 'b-induct-24',
    eventId: 'ev-24-1',
    amount: 1980,
    dateEpoch: 1745510400,
    notes: 'Full payment cleared',
    receiptUrl: null
  },
  {
    id: 'tx-24-4',
    academicYear: '2024-2025',
    type: 'expense',
    status: 'realtime',
    title: 'Lab Test Equipment & Microcontrollers',
    category: 'Hardware & Hackathon Kits',
    budgetId: 'b-tech-24',
    eventId: 'ev-24-2',
    amount: 550,
    dateEpoch: 1731600000,
    notes: 'Oscilloscope probes and STM32 boards',
    receiptUrl: null
  },

  // 2026-2027 (Future year planning)
  {
    id: 'tx-26-1',
    academicYear: '2026-2027',
    type: 'income',
    status: 'planned',
    title: 'Projected Dean Fund Grant AY 26-27',
    category: 'University / Dept Funds',
    budgetId: 'b-gen-26',
    eventId: null,
    amount: 3500,
    dateEpoch: 1787702400,
    notes: 'Expected renewal of chapter baseline grant',
    receiptUrl: null
  },
  {
    id: 'tx-26-2',
    academicYear: '2026-2027',
    type: 'expense',
    status: 'planned',
    title: 'Centennial Hackathon Arena Booking Deposit',
    category: 'Hardware & Hackathon Kits',
    budgetId: 'b-tech-26',
    eventId: 'ev-26-1',
    amount: 1500,
    dateEpoch: 1791590400,
    notes: 'Campus Student Union multi-purpose arena reservation',
    receiptUrl: null
  }
];
