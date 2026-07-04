import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle2, UserCheck, Clock, MessageSquare, ListTodo, LogOut, Sun, Moon, 
  Search, ShieldAlert, Award, FileText, Check, X, AlertCircle, Plus, Send, AlertTriangle, KeyRound 
} from 'lucide-react';
import { 
  getAdminStats, getStudents, approveStudent, rejectStudent, toggleStudentStatus, 
  getBatches, getAttendanceSheet, markBulkAttendance, getLiveAttendanceFeed, 
  createAnnouncement, getMockNotificationLogs, clearMockNotificationLogs, changePassword 
} from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function AdminDashboard({ darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters/Searches
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBatchFilter, setStudentBatchFilter] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');

  // Attendance Tab State
  const [attendanceBatch, setAttendanceBatch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  // Announcement State
  const [annForm, setAnnForm] = useState({ title: '', content: '', target_batch: '' });
  const [annLoading, setAnnLoading] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);

  // Approval Modal/Notice
  const [approvedCreds, setApprovedCreds] = useState(null);

  const navigate = useNavigate();

  // Load all initial data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await getAdminStats();
      setStats(statsData);
      
      const studentsData = await getStudents();
      setStudents(studentsData);
      
      const batchesData = await getBatches();
      setBatches(batchesData);
      if (batchesData.length > 0 && !attendanceBatch) {
        setAttendanceBatch(batchesData[0].id.toString());
      }
      
      const feedData = await getLiveAttendanceFeed();
      setLiveFeed(feedData);

      const logs = getMockNotificationLogs();
      setNotificationLogs(logs);
    } catch (err) {
      console.error("Dashboard loading failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Load attendance sheet when batch or date changes
  useEffect(() => {
    if (attendanceBatch && attendanceDate && activeTab === 'attendance') {
      loadAttendanceSheet();
    }
  }, [attendanceBatch, attendanceDate, activeTab]);

  const loadAttendanceSheet = async () => {
    setAttLoading(true);
    try {
      const sheet = await getAttendanceSheet(attendanceBatch, attendanceDate);
      setAttendanceSheet(sheet);
    } catch (err) {
      console.error(err);
    } finally {
      setAttLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Actions
  const handleApprove = async (id) => {
    try {
      const creds = await approveStudent(id);
      setApprovedCreds(creds);
      loadDashboardData();
    } catch (err) {
      alert("Approval failed: " + err.message);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      try {
        await rejectStudent(id);
        loadDashboardData();
      } catch (err) {
        alert("Rejection failed: " + err.message);
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const action = currentStatus === 'suspended' ? 'activate' : 'suspend';
    if (window.confirm(`Are you sure you want to ${action} this student account?`)) {
      try {
        await toggleStudentStatus(id, action);
        loadDashboardData();
      } catch (err) {
        alert("Action failed: " + err.message);
      }
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceSheet(prev => prev.map(item => 
      item.student_id === studentId ? { ...item, status } : item
    ));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceSheet(prev => prev.map(item => 
      item.student_id === studentId ? { ...item, remarks } : item
    ));
  };

  const handleSaveAttendance = async () => {
    try {
      const records = attendanceSheet.map(item => ({
        student_id: item.student_id,
        status: item.status,
        remarks: item.remarks
      }));
      await markBulkAttendance(attendanceDate, records);
      alert("Attendance saved successfully!");
      loadDashboardData();
    } catch (err) {
      alert("Saving attendance failed: " + err.message);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    setAnnLoading(true);
    setAnnSuccess(false);
    try {
      await createAnnouncement(annForm);
      setAnnForm({ title: '', content: '', target_batch: '' });
      setAnnSuccess(true);
      loadDashboardData();
      setTimeout(() => setAnnSuccess(false), 5000);
    } catch (err) {
      alert("Announcement dispatch failed: " + err.message);
    } finally {
      setAnnLoading(false);
    }
  };

  const handleClearLogs = () => {
    clearMockNotificationLogs();
    setNotificationLogs([]);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'DOB', 'Email', 'Phone', 'Batch', 'License Status', 'Status', 'Registration Date'];
    const rows = students.map(s => [
      s.id,
      s.full_name,
      s.dob,
      s.email,
      s.phone,
      s.batch_details?.name || 'N/A',
      s.license_status,
      s.status,
      s.registration_date
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AutoDrive_Students_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Settings Change Password State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ success: null, error: null });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ success: null, error: "New passwords do not match" });
      return;
    }
    setPasswordLoading(true);
    setPasswordStatus({ success: null, error: null });
    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordStatus({ success: "Password updated successfully!", error: null });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setPasswordStatus({ success: null, error: err.response?.data?.error || "Password change failed" });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Filtered Students list
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.email.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.phone.includes(studentSearch);
    const matchesBatch = studentBatchFilter === '' || s.preferred_batch === parseInt(studentBatchFilter);
    const matchesStatus = studentStatusFilter === '' || s.status === studentStatusFilter;
    return matchesSearch && matchesBatch && matchesStatus;
  });

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl">
              A
            </div>
            <div>
              <span className="font-extrabold text-md tracking-tight block">AutoDrive Portal</span>
              <span className="text-xs text-indigo-500 font-semibold uppercase tracking-widest">Manager</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: students.filter(s => s.status === 'pending').length },
              { id: 'students', label: 'Students Directory', icon: UserCheck },
              { id: 'attendance', label: 'Mark Attendance', icon: ListTodo },
              { id: 'announcements', label: 'Broadcaster', icon: MessageSquare },
              { id: 'logs', label: 'Notification Logs', icon: Clock, badge: notificationLogs.length },
              { id: 'settings', label: 'Settings', icon: KeyRound },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setApprovedCreds(null); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-455 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span className="text-xs font-bold">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold transition"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 py-4 px-6 sm:px-8 flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-wide">
            {activeTab === 'overview' && 'Administrative Overview'}
            {activeTab === 'approvals' && 'Pending Application Center'}
            {activeTab === 'students' && 'Students Directory'}
            {activeTab === 'attendance' && 'Daily Attendance Sheets'}
            {activeTab === 'announcements' && 'Batch Broadcaster Panel'}
            {activeTab === 'logs' && 'Simulated Dispatches Archive'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Dynamic Pages contents */}
        <div className="p-6 sm:p-8 flex-1">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading data...</div>
          ) : (
            <>
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Top Stats Cards */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Registrations', value: stats.metrics.total_students, icon: Users, color: 'indigo' },
                      { label: 'Active Students', value: stats.metrics.active_students, icon: UserCheck, color: 'emerald' },
                      { label: 'Pending Approvals', value: stats.metrics.pending_registrations, icon: AlertCircle, color: 'amber' },
                      { label: 'Today\'s Attendance', value: `${stats.metrics.today_attendance_rate}%`, icon: CheckCircle2, color: 'blue' },
                    ].map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                            <h3 className="text-3xl font-extrabold">{card.value}</h3>
                          </div>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${card.color}-100 dark:bg-${card.color}-950/50 text-${card.color}-600 dark:text-${card.color}-400`}>
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visual Analytics */}
                  <div className="grid lg:grid-cols-12 gap-8">
                    {/* Pie Chart: Batch Distribution */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-5 space-y-4">
                      <h4 className="text-md font-bold uppercase tracking-wide">Batch-wise Distribution</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.batch_stats}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="student_count"
                            >
                              {stats.batch_stats.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} Students`, 'Count']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart: Attendance trends */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-7 space-y-4">
                      <h4 className="text-md font-bold uppercase tracking-wide">Weekly Session Attendance Rate (%)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { day: 'Mon', Present: 85, Absent: 15 },
                              { day: 'Tue', Present: 92, Absent: 8 },
                              { day: 'Wed', Present: 78, Absent: 22 },
                              { day: 'Thu', Present: 88, Absent: 12 },
                              { day: 'Fri', Present: 90, Absent: 10 },
                            ]}
                          >
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Live Feed Feed Ticker */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-md font-bold uppercase tracking-wide">Live Attendance Ticker Feed</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                            <th className="py-2.5">Student Name</th>
                            <th>Trainer Name</th>
                            <th>Batch</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveFeed.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-slate-500">No attendance registered for today.</td>
                            </tr>
                          ) : (
                            liveFeed.map((f, idx) => (
                              <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                <td className="py-3 font-semibold">{f.student_name}</td>
                                <td className="text-slate-500">{f.trainer_name}</td>
                                <td>{f.batch_name}</td>
                                <td className="text-slate-400 font-mono text-xs">{f.time}</td>
                                <td>
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                    f.status === 'present' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-500'
                                  }`}>
                                    {f.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Approvals */}
              {activeTab === 'approvals' && (
                <div className="space-y-6 animate-fadeIn">
                  {approvedCreds && (
                    <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-4">
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <h4 className="font-extrabold text-emerald-800 dark:text-emerald-300">Approval Credentials Generated Successfully!</h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400/80">
                            The student has been auto-notified via SMS, WhatsApp, and Email. Details are shown below:
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100/50 dark:border-emerald-950/40 text-sm max-w-sm space-y-2 font-mono">
                        <p><b>Login ID:</b> {approvedCreds.username}</p>
                        <p><b>Password:</b> {approvedCreds.password}</p>
                      </div>
                      <button 
                        onClick={() => setApprovedCreds(null)} 
                        className="py-1.5 px-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 rounded-lg transition"
                      >
                        Dismiss Notice
                      </button>
                    </div>
                  )}

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                            <th className="py-3">Name</th>
                            <th>Contact Info</th>
                            <th>Preferred Batch</th>
                            <th>License Status</th>
                            <th>Emergency Contact</th>
                            <th className="text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.filter(s => s.status === 'pending').length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500">No applications pending approval.</td>
                            </tr>
                          ) : (
                            students.filter(s => s.status === 'pending').map((s) => (
                              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <td className="py-4 font-bold">{s.full_name}</td>
                                <td className="space-y-0.5">
                                  <p className="block font-medium">{s.email}</p>
                                  <p className="block text-xs text-slate-400">{s.phone}</p>
                                </td>
                                <td>{s.batch_details?.name || 'N/A'}</td>
                                <td>
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                                    {s.license_status}
                                  </span>
                                </td>
                                <td className="text-xs text-slate-500">{s.emergency_contact}</td>
                                <td className="text-right space-x-2">
                                  <button
                                    onClick={() => handleApprove(s.id)}
                                    className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/55 transition inline-flex items-center gap-1 font-bold text-xs"
                                    title="Approve student"
                                  >
                                    <Check className="w-4 h-4" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(s.id)}
                                    className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition inline-flex items-center gap-1 font-bold text-xs"
                                    title="Reject student"
                                  >
                                    <X className="w-4 h-4" /> Reject
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Students Directory */}
              {activeTab === 'students' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Filters bar */}
                  <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student directories..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <select
                        value={studentBatchFilter}
                        onChange={(e) => setStudentBatchFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Batches</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>

                      <select
                        value={studentStatusFilter}
                        onChange={(e) => setStudentStatusFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>

                      <button
                        onClick={handleExportCSV}
                        className="py-1.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> Export Directory (CSV)
                      </button>
                    </div>
                  </div>

                  {/* List View */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                            <th className="py-3">Name</th>
                            <th>Credentials</th>
                            <th>Contact Info</th>
                            <th>Active Batch</th>
                            <th>Status</th>
                            <th className="text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500">No students matching criteria.</td>
                            </tr>
                          ) : (
                            filteredStudents.map((s) => (
                              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <td className="py-4 font-bold">{s.full_name}</td>
                                <td>
                                  {s.status === 'approved' || s.status === 'suspended' ? (
                                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                                      {s.full_name.split(' ')[0].toLowerCase()}.{s.id}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic text-xs">Unassigned</span>
                                  )}
                                </td>
                                <td className="space-y-0.5">
                                  <p className="block font-medium">{s.email}</p>
                                  <p className="block text-xs text-slate-400">{s.phone}</p>
                                </td>
                                <td>{s.batch_details?.name || 'N/A'}</td>
                                <td>
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                    s.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' :
                                    s.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-500' :
                                    s.status === 'suspended' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-455'
                                  }`}>
                                    {s.status}
                                  </span>
                                </td>
                                <td className="text-right">
                                  {s.status !== 'pending' && s.status !== 'rejected' && (
                                    <button
                                      onClick={() => handleStatusToggle(s.id, s.status)}
                                      className={`py-1 px-3 text-xs font-bold rounded-lg transition border ${
                                        s.status === 'suspended'
                                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 hover:bg-emerald-100/50'
                                          : 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-100/50'
                                      }`}
                                    >
                                      {s.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Attendance Sheets */}
              {activeTab === 'attendance' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Selectors */}
                  <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Batch</label>
                      <select
                        value={attendanceBatch}
                        onChange={(e) => setAttendanceBatch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Date</label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Attendance List */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    {attLoading ? (
                      <div className="py-8 text-center text-slate-500">Fetching batch sheet...</div>
                    ) : attendanceSheet.length === 0 ? (
                      <div className="py-8 text-center text-slate-500">No active students in this batch yet.</div>
                    ) : (
                      <div className="space-y-6">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                                <th className="py-3">Student Name</th>
                                <th className="text-center">Status</th>
                                <th className="pl-6">Remarks / Lesson Progression</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceSheet.map((item) => (
                                <tr key={item.student_id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800">
                                  <td className="py-4 font-bold">{item.student_name}</td>
                                  <td>
                                    <div className="flex items-center justify-center gap-2">
                                      {['present', 'absent', 'excused'].map((statusOption) => (
                                        <button
                                          key={statusOption}
                                          type="button"
                                          onClick={() => handleAttendanceChange(item.student_id, statusOption)}
                                          className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase border transition ${
                                            item.status === statusOption
                                              ? statusOption === 'present' 
                                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                                                : statusOption === 'absent'
                                                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-500 border-rose-300 dark:border-rose-800'
                                                  : 'bg-amber-100 dark:bg-amber-950/40 text-amber-500 border-amber-300 dark:border-amber-800'
                                              : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                          }`}
                                        >
                                          {statusOption}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="pl-6">
                                    <input
                                      type="text"
                                      value={item.remarks}
                                      onChange={(e) => handleRemarksChange(item.student_id, e.target.value)}
                                      placeholder="e.g. clutch shifting, parallel parking progress"
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            type="button"
                            onClick={handleSaveAttendance}
                            className="py-2.5 px-6 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition duration-200"
                          >
                            Save Attendance Sheet
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Broadcasting Announcements */}
              {activeTab === 'announcements' && (
                <div className="grid lg:grid-cols-12 gap-8 animate-fadeIn">
                  {/* Composer form */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm lg:col-span-7 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold">New Notification Broadcaster</h3>
                      <p className="text-xs text-slate-400">
                        Dispatch alerts instantly. This triggers real-time simulated <b>SMS</b>, <b>WhatsApp</b>, and <b>Email</b> dispatches to target students.
                      </p>
                    </div>

                    {annSuccess && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span>Announcement broadcast successfully sent! Check the Notification Logs tab to view simulated dispatches.</span>
                      </div>
                    )}

                    <form onSubmit={handleSendAnnouncement} className="space-y-4">
                      {/* Target Batch */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Audience</label>
                        <select
                          value={annForm.target_batch}
                          onChange={(e) => setAnnForm(prev => ({ ...prev, target_batch: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">All Students (Broadcast)</option>
                          {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Announcement Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</label>
                        <input
                          type="text"
                          required
                          value={annForm.title}
                          onChange={(e) => setAnnForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Today evening session is cancelled..."
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                      </div>

                      {/* Message Content */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Message Content</label>
                        <textarea
                          required
                          rows={4}
                          value={annForm.content}
                          onChange={(e) => setAnnForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Please note that today's driving session is cancelled due to rain. Please attend tomorrow."
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={annLoading}
                        className="py-2.5 px-6 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 transition duration-200"
                      >
                        <Send className="w-4 h-4" />
                        {annLoading ? "Broadcasting..." : "Broadcast Announcement"}
                      </button>
                    </form>
                  </div>

                  {/* Informational Help Box */}
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-6 rounded-3xl lg:col-span-5 h-fit space-y-4">
                    <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Operational Alert Channels</span>
                    </div>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                      Broadcasting triggers simulated integrations with Twilio (SMS), WhatsApp Business API, and SMTP/Email hosts. 
                      Since no API keys are loaded for local safety, the system records logs inside the <b>Notification Logs</b> tab so you can audit the payloads immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 6: Notification Logs */}
              {activeTab === 'logs' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h3 className="text-md font-bold uppercase tracking-wide">Communication Dispatch Audit Trail</h3>
                      <p className="text-xs text-slate-400">Auditable logs of mock SMS, WhatsApp, and Emails sent to registered students.</p>
                    </div>
                    {notificationLogs.length > 0 && (
                      <button
                        onClick={handleClearLogs}
                        className="py-1.5 px-3 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/15 border border-rose-250 rounded-xl transition"
                      >
                        Clear Audit Trail
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {notificationLogs.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-center text-slate-500">
                        No alerts have been dispatched in this session. Send an announcement or approve a student registration to trigger.
                      </div>
                    ) : (
                      notificationLogs.map((log) => (
                        <div key={log.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                          {/* Log Header */}
                          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-3">
                            <div>
                              <h4 className="font-bold text-md text-indigo-600 dark:text-indigo-400">Target Student: {log.student_name}</h4>
                              <p className="text-xs text-slate-455">
                                Phone: <span className="font-mono">{log.phone}</span> | Email: <span className="font-mono">{log.email}</span>
                              </p>
                            </div>
                            <span className="text-xs font-mono text-slate-400">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          {/* Payload channels */}
                          <div className="grid sm:grid-cols-3 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/50 space-y-2">
                              <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">📱 [SMS Payload]</span>
                              <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-mono">"{log.title}: {log.message.slice(0, 80)}..."</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 space-y-2">
                              <span className="font-bold uppercase tracking-wider text-emerald-500/80 block text-[10px]">💬 [WhatsApp Payload]</span>
                              <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-mono font-medium">🟢 *{log.title}*<br />{log.message.slice(0, 80)}...</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/50 space-y-2">
                              <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">📧 [Email Payload]</span>
                              <div className="space-y-1 font-mono text-slate-600 dark:text-slate-350">
                                <p><b>Subj:</b> {log.title}</p>
                                <p className="leading-relaxed">Dear {log.student_name}, {log.message.slice(0, 60)}...</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 7: Settings */}
              {activeTab === 'settings' && (
                <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-bold">Account Security Settings</h3>
                    <p className="text-xs text-slate-400">Change your administrator access password below.</p>
                  </div>

                  {passwordStatus.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>{passwordStatus.success}</span>
                    </div>
                  )}

                  {passwordStatus.error && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex gap-2 text-sm text-rose-600 dark:text-rose-455 font-semibold">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                      <span>{passwordStatus.error}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* Old Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">Current Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="py-2.5 px-6 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition duration-200"
                    >
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
